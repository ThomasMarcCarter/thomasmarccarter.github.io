import { describe, expect, it } from 'vitest';
import data from './items.json';
import { normalise } from '../normalise';
import { ITEM_STATS, type Item, type ItemData } from './types';

const { ddragonVersion, items } = data as ItemData;
const ids = new Set(items.map((i) => i.id));
const fields: (keyof Item)[] = [
  'id',
  'name',
  'aliases',
  'cost',
  'combineCost',
  'sell',
  'stats',
  'tags',
  'from',
  'into',
  'popularity',
  'icon',
];

describe('items.json', () => {
  it('records the Data Dragon version for icon URLs', () => {
    expect(ddragonVersion).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it('gives every item every field', () => {
    const gaps = items.flatMap((i) => fields.filter((f) => i[f] == null).map((f) => `${i.id} ${i.name}: ${f}`));
    expect(gaps).toEqual([]);
  });

  it('has unique ids and names', () => {
    expect(ids.size).toBe(items.length);
    expect(new Set(items.map((i) => i.name)).size).toBe(items.length);
  });

  it('ranks popularity 1 to N with no gaps or ties', () => {
    expect(items.map((i) => i.popularity).sort((a, b) => a - b)).toEqual(items.map((_, n) => n + 1));
  });

  it('uses only known stats', () => {
    const known = new Set<string>(ITEM_STATS);
    expect(items.flatMap((i) => Object.keys(i.stats).filter((s) => !known.has(s)))).toEqual([]);
  });

  it('stores aliases normalised and never shares one between items', () => {
    const owners = new Map<string, string>();
    const problems = items.flatMap((i) =>
      i.aliases.flatMap((a) => {
        const other = owners.get(a);
        owners.set(a, i.name);
        return [
          ...(a !== normalise(a) ? [`${i.name}: ${a} not normalised`] : []),
          ...(other && other !== i.name ? [`${a}: ${other}, ${i.name}`] : []),
        ];
      }),
    );
    expect(problems).toEqual([]);
  });

  it('builds only from and into items that exist', () => {
    expect(items.flatMap((i) => [...i.from, ...i.into].filter((x) => !ids.has(x)))).toEqual([]);
  });
});
