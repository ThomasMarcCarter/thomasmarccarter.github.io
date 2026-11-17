import { describe, expect, it } from 'vitest';
import { readJson, writeJson } from './storage';

const memory = () => {
  const data = new Map<string, string>();
  return {
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => void data.set(k, v),
  } as unknown as Storage;
};
const broken = {
  getItem: () => {
    throw new Error('blocked');
  },
  setItem: () => {
    throw new Error('blocked');
  },
} as unknown as Storage;

describe('storage', () => {
  it('round-trips JSON under the lolillion prefix', () => {
    const s = memory();
    writeJson('stats', { best: 3 }, s);
    expect(s.getItem('lolillion:stats')).toBe('{"best":3}');
    expect(readJson('stats', null, s)).toEqual({ best: 3 });
  });

  it('falls back when the key is missing or the JSON is broken', () => {
    const s = memory();
    expect(readJson('missing', 'fallback', s)).toBe('fallback');
    s.setItem('lolillion:bad', '{not json');
    expect(readJson('bad', 'fallback', s)).toBe('fallback');
  });

  it('never throws when storage is blocked', () => {
    expect(readJson('stats', 'fallback', broken)).toBe('fallback');
    expect(() => writeJson('stats', 1, broken)).not.toThrow();
  });

  it('copes with no storage at all', () => {
    expect(readJson('stats', 'fallback', undefined)).toBe('fallback');
  });
});
