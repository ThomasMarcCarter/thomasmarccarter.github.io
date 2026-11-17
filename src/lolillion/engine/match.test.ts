import { describe, expect, it } from 'vitest';
import { champions, items } from '../data/questions';
import { editDistance, matchAnswer, suggest } from './match';

const names = (entries: { name: string }[]) => entries.map((e) => e.name);

describe('editDistance', () => {
  it('counts single-character edits', () => {
    expect(editDistance('jinx', 'jinx')).toBe(0);
    expect(editDistance('jinxx', 'jinx')).toBe(1);
    expect(editDistance('kitten', 'sitting')).toBe(3);
  });
  it('counts swapped neighbouring letters as one edit', () => {
    expect(editDistance('yasou', 'yasuo')).toBe(1);
  });
});

describe('matchAnswer', () => {
  it('ignores spacing, case and punctuation', () => {
    expect(matchAnswer('kai sa', champions)?.name).toBe("Kai'Sa");
    expect(matchAnswer('DR MUNDO', champions)?.name).toBe('Dr. Mundo');
  });
  it('accepts aliases and ids', () => {
    expect(matchAnswer('mf', champions)?.name).toBe('Miss Fortune');
    expect(matchAnswer('wukong', champions)?.id).toBe('MonkeyKing');
    expect(matchAnswer('monkeyking', champions)?.id).toBe('MonkeyKing');
    expect(matchAnswer('ie', items)?.name).toBe('Infinity Edge');
  });
  it('falls back to the closest spelling', () => {
    expect(matchAnswer('jinxx', champions)?.name).toBe('Jinx');
    expect(matchAnswer('malphit', champions)?.name).toBe('Malphite');
  });
  it('returns null for empty or unmatched input', () => {
    expect(matchAnswer('', champions)).toBeNull();
    expect(matchAnswer("'''", champions)).toBeNull();
    expect(matchAnswer('zzzzzzzz', champions)).toBeNull();
  });
  it('only searches the pool it is given', () => {
    expect(matchAnswer('infinity edge', champions)).toBeNull();
  });
});

describe('suggest', () => {
  it('lists prefix matches in name order', () => {
    expect(names(suggest('ka', champions))).toEqual(["Kai'Sa", 'Kalista', 'Karma', 'Karthus', 'Kassadin', 'Katarina']);
  });
  it('puts an exact alias match first', () => {
    expect(names(suggest('vi', champions))[0]).toBe('Vi');
    expect(names(suggest('mf', champions))[0]).toBe('Miss Fortune');
  });
  it('limits the number of suggestions', () => {
    expect(suggest('a', champions, 3)).toHaveLength(3);
  });
  it('adds close spellings after prefix matches', () => {
    expect(names(suggest('yasou', champions))).toContain('Yasuo');
  });
  it('suggests nothing for empty input', () => {
    expect(suggest('  ', champions)).toEqual([]);
  });
});
