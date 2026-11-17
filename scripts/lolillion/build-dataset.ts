// Builds src/lolillion/data/champions.json (Data Dragon, Meraki, Riot Universe, overrides.json)
// and src/lolillion/data/items.json (Data Dragon, item-overrides.json).
// Run with `npm run lolillion:data`, then review the printed report.
import { readFile, writeFile } from 'node:fs/promises';
import { mergeChampions, type DdChampion, type MerakiChampion, type UniverseChampion } from './merge.ts';
import { buildItems, type DdItem } from './items.ts';
import type { Champion, ChampionData, Item, ItemData } from '../../src/lolillion/data/types.ts';

const OUTPUT = new URL('../../src/lolillion/data/champions.json', import.meta.url);
const OVERRIDES = new URL('./overrides.json', import.meta.url);
const ITEM_OUTPUT = new URL('../../src/lolillion/data/items.json', import.meta.url);
const ITEM_OVERRIDES = new URL('./item-overrides.json', import.meta.url);

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} fetching ${url}`);
  return res.json() as Promise<T>;
}

const [version] = await getJson<string[]>('https://ddragon.leagueoflegends.com/api/versions.json');
const [ddragon, meraki, universe, ddItems] = await Promise.all([
  getJson<{ data: Record<string, DdChampion> }>(
    `https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/champion.json`,
  ),
  getJson<Record<string, MerakiChampion>>(
    'https://cdn.merakianalytics.com/riot/lol/resources/latest/en-US/champions.json',
  ),
  getJson<{ champions: UniverseChampion[] }>(
    'https://universe-meeps.leagueoflegends.com/v1/en_us/champion-browse/index.json',
  ),
  getJson<{ data: Record<string, DdItem> }>(`https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/item.json`),
]);
const overrides: Record<string, Partial<Champion>> = JSON.parse(await readFile(OVERRIDES, 'utf8'));
const itemOverrides: Record<string, Partial<Item>> = JSON.parse(await readFile(ITEM_OVERRIDES, 'utf8'));

const result = mergeChampions(
  { ddragon: Object.values(ddragon.data), meraki, universe: universe.champions },
  overrides,
);
const itemResult = buildItems(ddItems.data, itemOverrides);

const output: ChampionData = { ddragonVersion: version, champions: result.champions };
const itemOutput: ItemData = { ddragonVersion: version, items: itemResult.items };
await writeFile(OUTPUT, JSON.stringify(output, null, 2) + '\n');
await writeFile(ITEM_OUTPUT, JSON.stringify(itemOutput, null, 2) + '\n');

console.log(`Data Dragon ${version}: wrote ${result.champions.length} champions.\n`);
console.log(`Missing fields (${result.missing.length} champions):`);
for (const m of result.missing) console.log(`  ${m.id}: ${m.fields.join(', ')}`);
console.log(`\nSource conflicts (${result.conflicts.length}):`);
for (const c of result.conflicts) console.log(`  ${c.id} ${c.field}: ${JSON.stringify(c.values)}`);
console.log(`\nOverrides for unknown champions (${result.unknownOverrides.length}): ${result.unknownOverrides.join(', ')}`);

console.log(`\nItems: wrote ${itemResult.items.length}.`);
console.log(`Missing item fields (${itemResult.missing.length} items):`);
for (const m of itemResult.missing) console.log(`  ${m.id}: ${m.fields.join(', ')}`);
console.log(`Unknown stat labels (${itemResult.unknownStats.length}): ${itemResult.unknownStats.join(', ')}`);
console.log(`Item overrides for unknown ids (${itemResult.unknownOverrides.length}): ${itemResult.unknownOverrides.join(', ')}`);
