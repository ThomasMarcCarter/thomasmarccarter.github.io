import { describe, expect, it } from 'vitest';
import data from './champions.json';
import { CLASSES, GENDERS, POSITIONS, RANGE_TYPES, REGIONS, type Champion, type ChampionData } from './types';

const { ddragonVersion, champions } = data as ChampionData;
const fields: (keyof Champion)[] = [
  'id',
  'name',
  'aliases',
  'positions',
  'classes',
  'region',
  'species',
  'resource',
  'rangeType',
  'gender',
  'releaseYear',
  'popularity',
  'icon',
];
const isEmpty = (v: unknown) => v === undefined || v === '' || (Array.isArray(v) && v.length === 0);

describe('champions.json', () => {
  it('records the Data Dragon version for icon URLs', () => {
    expect(ddragonVersion).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it.each(champions.map((c) => [c.id, c] as const))('%s has every field', (_, champion) => {
    expect(fields.filter((f) => isEmpty(champion[f]))).toEqual([]);
  });

  it('has unique ids', () => {
    expect(new Set(champions.map((c) => c.id)).size).toBe(champions.length);
  });

  it('ranks popularity 1 to N with no gaps or ties', () => {
    const ranks = champions.map((c) => c.popularity).sort((a, b) => a - b);
    expect(ranks).toEqual(champions.map((_, i) => i + 1));
  });

  it('uses only known enum values', () => {
    for (const c of champions) {
      // Missing arrays are reported by the "has every field" test.
      expect(POSITIONS, c.id).toEqual(expect.arrayContaining(c.positions ?? []));
      expect(CLASSES, c.id).toEqual(expect.arrayContaining(c.classes ?? []));
      if (c.region) expect(REGIONS, c.id).toContain(c.region);
      if (c.gender) expect(GENDERS, c.id).toContain(c.gender);
      if (c.rangeType) expect(RANGE_TYPES, c.id).toContain(c.rangeType);
    }
  });

  it('has plausible release years', () => {
    for (const c of champions) {
      expect(c.releaseYear, c.id).toBeGreaterThanOrEqual(2009);
      expect(c.releaseYear, c.id).toBeLessThanOrEqual(new Date().getFullYear());
    }
  });
});
