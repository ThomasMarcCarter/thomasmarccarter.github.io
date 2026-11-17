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
