import { describe, expect, it } from 'vitest';
import { compareWithWiki, parseLuaTable } from './wiki.ts';
import type { Item } from '../../src/lolillion/data/types.ts';

const LUA = `-- <pre>
-- Item data
return {
  ["Chain Vest"] = {
    ["id"] = 1031,
    ["tier"] = 2,
    ["type"] = {"Epic"},
    ["modes"] = { ["classic sr 5v5"] = true, ["aram"] = true, ["ar"] = false, },
    ["stats"] = { ["armor"] = 40, },
    ["recipe"] = {"Cloth Armor"},
    ["buy"] = 800,
    ["nickname"] = "vest \\"plate\\"",
  },
  ["Arena Thing"] = { ["id"] = 4000, ["modes"] = { ["classic sr 5v5"] = false, ["ar"] = true }, ["buy"] = 2500 },
  ["Cloth Armor"] = { ["id"] = 1029, ["modes"] = { ["classic sr 5v5"] = true }, ["buy"] = 300, ["neg"] = -1.5, ["nothing"] = nil },
  ["Wiki Only"] = { ["id"] = 9999, ["modes"] = { ["classic sr 5v5"] = true }, ["recipe"] = {"Cloth Armor"}, ["buy"] = 1100 },
}
-- </pre>`;

describe('parseLuaTable', () => {
  const data = parseLuaTable(LUA) as Record<string, Record<string, unknown>>;
  it('reads keyed tables, lists, strings, numbers and booleans', () => {
    expect(data['Chain Vest']).toEqual({
      id: 1031,
      tier: 2,
      type: ['Epic'],
      modes: { 'classic sr 5v5': true, aram: true, ar: false },
      stats: { armor: 40 },
      recipe: ['Cloth Armor'],
      buy: 800,
      nickname: 'vest "plate"',
    });
  });
  it('reads negative decimals and drops nil values', () => {
    expect(data['Cloth Armor']).toEqual({ id: 1029, modes: { 'classic sr 5v5': true }, buy: 300, neg: -1.5 });
  });
});

describe('compareWithWiki', () => {
  const item = (id: string, name: string, cost: number, from: string[] = []): Item => ({
    id, name, cost, from, aliases: [], combineCost: 0, sell: 0, stats: {}, tags: [], into: [], popularity: 1, icon: '',
  });
  const ours = [item('1029', 'Cloth Armor', 300), item('1031', 'Chain Vest', 900, ['1029']), item('5555', 'Ours Only', 400)];
  const report = compareWithWiki(ours, parseLuaTable(LUA) as Record<string, Record<string, unknown>>);

  it('lists Rift items the wiki has that we lack, ignoring other modes', () => {
    expect(report.missingFromOurs).toEqual(['Wiki Only']);
  });
  it('lists our items the wiki does not sell on the Rift', () => {
    expect(report.notOnWikiRift).toEqual(['Ours Only']);
  });
  it('reports price and recipe differences', () => {
    expect(report.priceDiffs).toEqual([{ name: 'Chain Vest', ours: 900, wiki: 800 }]);
    expect(report.recipeDiffs).toEqual([]);
  });
});

describe('compareWithWiki edge cases', () => {
  const item = (id: string, name: string, cost: number): Item => ({
    id, name, cost, from: [], aliases: [], combineCost: 0, sell: 0, stats: {}, tags: [], into: [], popularity: 1, icon: '',
  });
  const wiki = {
    'Blade of the Ruined King': { modes: { 'classic sr 5v5': true }, buy: 3200 },
    'Stealth Ward': { modes: { 'classic sr 5v5': true }, buy: 0 },
    'Gunmetal Greaves': { modes: { 'classic sr 5v5': true }, buy: "=>Berserker's Greaves" },
  };
  const report = compareWithWiki(
    [item('3153', 'Blade of The Ruined King', 3200), item('3340', 'Stealth Ward', 0), item('3172', 'Gunmetal Greaves', 1500)],
    wiki,
  );
  it('matches names regardless of capitalisation', () => {
    expect(report.missingFromOurs).toEqual([]);
  });
  it('counts free trinkets and free upgrades as Rift items without comparing their price', () => {
    expect(report.notOnWikiRift).toEqual([]);
    expect(report.priceDiffs).toEqual([]);
  });
});

describe('compareWithWiki stats', () => {
  const ie: Item = {
    id: '3031', name: 'Infinity Edge', cost: 3450, from: [], aliases: [], combineCost: 0, sell: 0, tags: [], into: [],
    popularity: 1, icon: '', stats: { 'Attack Damage': 75, 'Critical Strike Chance': 25, 'Ability Haste': 10 },
  };
  const wiki = {
    'Infinity Edge': { modes: { 'classic sr 5v5': true }, buy: 3450, stats: { ad: 70, crit: 25, critdamage: 30, spec: 'text' } },
  };
  it('reports stats that differ, are missing, or are extra, mapping the wiki names to ours', () => {
    expect(compareWithWiki([ie], wiki).statDiffs).toEqual([
      {
        name: 'Infinity Edge',
        diffs: ['Attack Damage: ours 75, wiki 70', 'Ability Haste: ours 10, wiki none', 'Critical Strike Damage: ours none, wiki 30'],
      },
    ]);
  });
});
