import { describe, expect, it } from 'vitest';
import { mergeChampions, type Sources } from './merge.ts';

const dd = (id: string, name: string, attackrange: number) => ({
  id,
  name,
  tags: ['Fighter'],
  partype: 'Mana',
  stats: { attackrange },
  image: { full: `${id}.png` },
});

const sources: Sources = {
  ddragon: [
    { ...dd('Garen', 'Garen', 175), tags: ['Fighter', 'Tank'], partype: 'None' },
    dd('MonkeyKing', 'Wukong', 175),
    { ...dd('Newbie', 'Newbie', 550), partype: '' },
  ],
  meraki: {
    Garen: { positions: ['TOP'], attackType: 'MELEE', releaseDate: '2010-04-27' },
    MonkeyKing: { positions: ['JUNGLE', 'TOP'], attackType: 'MELEE', releaseDate: '2009-07-27' },
  },
  universe: [
    { name: 'Garen', 'associated-faction-slug': 'demacia', 'release-date': '2010-04-27T00:00:00.000Z' },
    { name: 'Wukong', 'associated-faction-slug': 'ionia', 'release-date': '2022-07-27T00:00:00.000Z' },
    { name: 'Newbie', 'associated-faction-slug': 'mount-targon', 'release-date': '2026-06-23T00:00:00.000Z' },
    { name: 'Not In Game', 'associated-faction-slug': 'unaffiliated', 'release-date': '2026-01-01T00:00:00.000Z' },
  ],
};

const byId = (result: ReturnType<typeof mergeChampions>, id: string) => result.champions.find((c) => c.id === id)!;

describe('mergeChampions', () => {
  it('combines all three sources for a champion', () => {
    const garen = byId(mergeChampions(sources, {}), 'Garen');
    expect(garen).toMatchObject({
      name: 'Garen',
      positions: ['Top'],
      classes: ['Fighter', 'Tank'],
      region: 'Demacia',
      rangeType: 'Melee',
      resource: 'None',
      releaseYear: 2010,
      icon: 'Garen.png',
    });
    expect(garen.aliases).toContain('garen');
  });

  it('matches Meraki by id and Universe by name when they differ', () => {
    const wukong = byId(mergeChampions(sources, {}), 'MonkeyKing');
    expect(wukong.positions).toEqual(['Jungle', 'Top']);
    expect(wukong.region).toBe('Ionia');
    expect(wukong.aliases).toEqual(expect.arrayContaining(['wukong', 'monkeyking']));
  });

  it('falls back to Data Dragon range and Universe year when Meraki has no entry', () => {
    const newbie = byId(mergeChampions(sources, {}), 'Newbie');
    expect(newbie.rangeType).toBe('Ranged');
    expect(newbie.releaseYear).toBe(2026);
    expect(newbie.resource).toBe('None');
  });

  it('maps faction slugs to region names', () => {
    expect(byId(mergeChampions(sources, {}), 'Newbie').region).toBe('Targon');
  });

  it('ignores Universe champions that are not in Data Dragon', () => {
    expect(mergeChampions(sources, {}).champions.map((c) => c.id)).toEqual(['Garen', 'MonkeyKing', 'Newbie']);
  });

  it('reports fields no source or override provides', () => {
    const { missing } = mergeChampions(sources, {});
    expect(missing.find((m) => m.id === 'Newbie')?.fields).toEqual(['positions', 'species', 'gender', 'popularity']);
    expect(missing.find((m) => m.id === 'Garen')?.fields).toEqual(['species', 'gender', 'popularity']);
  });

  it('lets overrides fill and replace fields', () => {
    const result = mergeChampions(sources, {
      Newbie: { positions: ['Mid'], species: ['Human'], gender: 'Female', popularity: 3, aliases: ['newb'] },
      Garen: { region: 'Noxus' },
    });
    expect(result.missing.find((m) => m.id === 'Newbie')).toBeUndefined();
    expect(byId(result, 'Newbie').aliases).toEqual(['newbie', 'newb']);
    expect(byId(result, 'Garen').region).toBe('Noxus');
  });

  it('reports overrides for unknown champions', () => {
    expect(mergeChampions(sources, { Nobody: {} }).unknownOverrides).toEqual(['Nobody']);
  });

  it('reports a release year conflict and keeps the Meraki year', () => {
    const result = mergeChampions(sources, {});
    expect(byId(result, 'MonkeyKing').releaseYear).toBe(2009);
    expect(result.conflicts).toContainEqual({
      id: 'MonkeyKing',
      field: 'releaseYear',
      values: { meraki: 2009, universe: 2022 },
    });
  });

  it('reports a range conflict between Meraki and Data Dragon', () => {
    const result = mergeChampions(
      { ...sources, meraki: { ...sources.meraki, Garen: { ...sources.meraki.Garen, attackType: 'RANGED' } } },
      {},
    );
    expect(result.conflicts).toContainEqual({
      id: 'Garen',
      field: 'rangeType',
      values: { meraki: 'Ranged', ddragon: 'Melee' },
    });
  });
});
