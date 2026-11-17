import { describe, expect, it } from 'vitest';
import { buildItems, parseStats, type DdItem } from './items.ts';

const IE_DESCRIPTION =
  '<mainText><stats><attention>75</attention> Attack Damage<br><attention>25%</attention> Critical Strike Chance<br><attention>30%</attention> Critical Strike Damage</stats><br><br><passive>Perfection</passive></mainText>';

const item = (name: string, extra: Partial<DdItem> = {}): DdItem => ({
  name,
  description: '<mainText><stats><attention>10</attention> Attack Damage</stats></mainText>',
  colloq: ';',
  gold: { base: 100, total: 1000, sell: 700, purchasable: true },
  tags: ['Damage'],
  maps: { '11': true, '12': true },
  image: { full: `${name}.png` },
  ...extra,
});

const dd: Record<string, DdItem> = {
  '1036': item('Long Sword', { into: ['3031', '3003', '9999'] }),
  '3031': item('Infinity Edge', {
    description: IE_DESCRIPTION,
    colloq: ';ie;inf',
    from: ['1036'],
    gold: { base: 725, total: 3500, sell: 2450, purchasable: true },
  }),
  '3003': item("Archangel's Staff", { from: ['1036'] }),
  '323003': item("Archangel's Staff", { from: ['1036'] }),
  '2003': item('Health Potion', { description: '<mainText><consumable>Drink</consumable></mainText>' }),
  '3330': item('Scarecrow Effigy', { requiredChampion: 'Fiddlesticks' }),
  '4000': item('Arena Only', { maps: { '11': false, '30': true } }),
  '4001': item('Not For Sale', { gold: { base: 0, total: 0, sell: 0, purchasable: false } }),
  '4002': item('Hidden', { inStore: false }),
  '4003': item('Ally Only', { requiredAlly: 'Ornn' }),
  '4004': item('Hidden From All', { hideFromAll: true }),
  '663039': item('Arena Variant'),
};

describe('parseStats', () => {
  it('reads flat and percent stats from the description', () => {
    expect(parseStats(IE_DESCRIPTION)).toEqual({
      stats: { 'Attack Damage': 75, 'Critical Strike Chance': 25, 'Critical Strike Damage': 30 },
      unknown: [],
    });
  });
  it('returns no stats when the description has none', () => {
    expect(parseStats('<mainText><consumable>Drink</consumable></mainText>')).toEqual({ stats: {}, unknown: [] });
  });
  it('reports labels it does not know', () => {
    expect(parseStats('<stats><attention>5</attention> Spooky Power</stats>').unknown).toEqual(['Spooky Power']);
  });
});

describe('buildItems', () => {
  const ids = (r: ReturnType<typeof buildItems>) => r.items.map((i) => i.id);
  const get = (r: ReturnType<typeof buildItems>, id: string) => r.items.find((i) => i.id === id)!;

  it("keeps only items buyable on Summoner's Rift by anyone", () => {
    expect(ids(buildItems(dd, {}))).toEqual(['1036', '2003', '3003', '3031']);
  });

  it('drops hidden items and long-id variants from other modes', () => {
    expect(ids(buildItems(dd, {}))).not.toContain('4004');
    expect(ids(buildItems(dd, {}))).not.toContain('663039');
    expect(ids(buildItems(dd, {}))).not.toContain('323003');
  });

  it('drops joke nicknames', () => {
    const r = buildItems({ '2051': item("Guardian's Horn", { colloq: ';horn;goldenarmofkobe;manwolf' }) }, {});
    expect(get(r, '2051').aliases).toEqual(['guardianshorn', 'horn']);
  });

  it('drops nicknames that more than one item uses', () => {
    const r = buildItems(
      {
        '1055': item("Doran's Blade", { colloq: ';dblade;db' }),
        '1083': item('Cull', { colloq: ';dblade' }),
      },
      {},
    );
    expect(get(r, '1055').aliases).toEqual(['doransblade', 'db']);
    expect(get(r, '1083').aliases).toEqual(['cull']);
  });

  it('maps gold, stats, tags and icon', () => {
    expect(get(buildItems(dd, {}), '3031')).toMatchObject({
      name: 'Infinity Edge',
      cost: 3500,
      combineCost: 725,
      sell: 2450,
      stats: { 'Attack Damage': 75, 'Critical Strike Chance': 25, 'Critical Strike Damage': 30 },
      tags: ['Damage'],
      icon: 'Infinity Edge.png',
    });
    expect(get(buildItems(dd, {}), '2003').stats).toEqual({});
  });

  it('keeps build paths only to kept items', () => {
    const r = buildItems(dd, {});
    expect(get(r, '1036').into).toEqual(['3031', '3003']);
    expect(get(r, '3031').from).toEqual(['1036']);
    expect(get(r, '2003')).toMatchObject({ from: [], into: [] });
  });

  it('builds aliases from the name, nicknames and overrides', () => {
    const r = buildItems(dd, { '3031': { aliases: ['Crit Sword'] } });
    expect(get(r, '3031').aliases).toEqual(['infinityedge', 'ie', 'inf', 'critsword']);
  });

  it('reports missing popularity and unknown override ids', () => {
    const r = buildItems(dd, { '3031': { popularity: 1 }, '7777': {} });
    expect(r.missing).toEqual([
      { id: '1036', fields: ['popularity'] },
      { id: '2003', fields: ['popularity'] },
      { id: '3003', fields: ['popularity'] },
    ]);
    expect(r.unknownOverrides).toEqual(['7777']);
  });

  it('collects unknown stat labels across items', () => {
    const r = buildItems({ '1': item('Odd', { description: '<stats><attention>1</attention> Spooky Power</stats>' }) }, {});
    expect(r.unknownStats).toEqual(['Spooky Power']);
  });
});
