// Cross-check our item data against a locally saved copy of the League of Legends Wiki's Module:ItemData/data.
// The wiki blocks scripted downloads, so the file is saved by hand and kept out of git (its text is CC BY-SA).
import type { Item, ItemStat } from '../../src/lolillion/data/types.ts';

type Lua = string | number | boolean | Lua[] | { [key: string]: Lua };

/** Reads the Lua table literal the wiki module returns: tables, strings, numbers, booleans; nil values are dropped. */
export function parseLuaTable(source: string): Lua {
  let i = 0;

  const skip = () => {
    for (;;) {
      while (i < source.length && /\s/.test(source[i])) i++;
      if (source.startsWith('--[[', i)) {
        const end = source.indexOf(']]', i);
        i = end === -1 ? source.length : end + 2;
      } else if (source.startsWith('--', i)) {
        const end = source.indexOf('\n', i);
        i = end === -1 ? source.length : end + 1;
      } else return;
    }
  };

  const fail = (what: string): never => {
    throw new Error(`Lua parse error at ${i}: expected ${what}, found ${JSON.stringify(source.slice(i, i + 20))}`);
  };

  const string = (): string => {
    const quote = source[i++];
    let out = '';
    while (i < source.length && source[i] !== quote) {
      if (source[i] === '\\') {
        const next = source[i + 1];
        out += next === 'n' ? '\n' : next === 't' ? '\t' : next;
        i += 2;
      } else out += source[i++];
    }
    i++;
    return out;
  };

  const value = (): Lua | undefined => {
    skip();
    const c = source[i];
    if (c === '{') return table();
    if (c === '"' || c === "'") return string();
    const number = /^-?\d+(\.\d+)?([eE][-+]?\d+)?/.exec(source.slice(i, i + 40));
    if (number) {
      i += number[0].length;
      return Number(number[0]);
    }
    for (const [word, v] of [['true', true], ['false', false], ['nil', undefined]] as const) {
      if (source.startsWith(word, i)) {
        i += word.length;
        return v;
      }
    }
    return fail('a value');
  };

  const table = (): Lua => {
    i++; // {
    const keyed: Record<string, Lua> = {};
    const listed: Lua[] = [];
    let hasKeys = false;
    for (;;) {
      skip();
      if (source[i] === '}') {
        i++;
        break;
      }
      let key: string | undefined;
      if (source[i] === '[') {
        i++;
        const k = value();
        skip();
        if (source[i++] !== ']') fail(']');
        key = String(k);
      } else {
        const name = /^[A-Za-z_]\w*\s*=(?!=)/.exec(source.slice(i, i + 80));
        if (name) {
          key = name[0].replace(/\s*=$/, '');
          i += name[0].length - 1;
        }
      }
      if (key !== undefined) {
        skip();
        if (source[i++] !== '=') fail('=');
        const v = value();
        hasKeys = true;
        if (v !== undefined) keyed[key] = v;
      } else {
        const v = value();
        if (v !== undefined) listed.push(v);
      }
      skip();
      if (source[i] === ',' || source[i] === ';') i++;
    }
    if (!hasKeys) return listed;
    listed.forEach((v, n) => (keyed[String(n + 1)] = v));
    return keyed;
  };

  skip();
  if (source.startsWith('return', i)) i += 'return'.length;
  return value() ?? fail('a table');
}

// buy is a price, 0 for free trinkets, or "=>Item" for free quest upgrades.
type WikiItem = {
  modes?: Record<string, boolean>;
  buy?: number | string;
  recipe?: string[];
  stats?: Record<string, number | string>;
};

// The wiki's stat keys mapped to ours; percent and flat versions share one name, as in the shop text.
const WIKI_STATS: Record<string, ItemStat> = {
  ad: 'Attack Damage',
  ap: 'Ability Power',
  hp: 'Health',
  mana: 'Mana',
  armor: 'Armor',
  mr: 'Magic Resist',
  as: 'Attack Speed',
  crit: 'Critical Strike Chance',
  critdamage: 'Critical Strike Damage',
  lethality: 'Lethality',
  armpen: 'Armor Penetration',
  mpen: 'Magic Penetration',
  mpenflat: 'Magic Penetration',
  ah: 'Ability Haste',
  lifesteal: 'Life Steal',
  omnivamp: 'Omnivamp',
  ms: 'Move Speed',
  msflat: 'Move Speed',
  hp5: 'Base Health Regen',
  hp5flat: 'Base Health Regen',
  mp5: 'Base Mana Regen',
  hsp: 'Heal and Shield Power',
  tenacity: 'Tenacity',
  gp10: 'Gold Per 10 Seconds',
};

export interface WikiReport {
  /** On the wiki's Summoner's Rift list but not in ours. */
  missingFromOurs: string[];
  /** In ours but not sold on the Rift according to the wiki. */
  notOnWikiRift: string[];
  priceDiffs: { name: string; ours: number; wiki: number }[];
  recipeDiffs: { name: string; ours: string[]; wiki: string[] }[];
  statDiffs: { name: string; diffs: string[] }[];
}

const SUMMONERS_RIFT = 'classic sr 5v5';

export function compareWithWiki(items: readonly Item[], wiki: Record<string, Record<string, unknown>>): WikiReport {
  // Names differ only in capitalisation between the sources ("Blade of The Ruined King").
  const key = (name: string) => name.toLowerCase();
  const onRift = new Map(
    Object.entries(wiki as Record<string, WikiItem>)
      .filter(([, w]) => w.modes?.[SUMMONERS_RIFT])
      .map(([name, w]) => [key(name), { name, w }]),
  );
  // Only items with a real price can be bought, so only they can be missing or differ in price and recipe.
  const buyable = [...onRift.values()].filter(({ w }) => typeof w.buy === 'number' && w.buy > 0);
  const ours = new Map(items.map((i) => [key(i.name), i]));
  const nameOf = new Map(items.map((i) => [i.id, i.name]));
  const sorted = (names: string[]) => [...names].sort();

  const report: WikiReport = {
    missingFromOurs: buyable.filter(({ name }) => !ours.has(key(name))).map(({ name }) => name).sort(),
    notOnWikiRift: items.filter((i) => !onRift.has(key(i.name))).map((i) => i.name).sort(),
    priceDiffs: [],
    recipeDiffs: [],
    statDiffs: [],
  };
  for (const { name, w } of buyable) {
    const item = ours.get(key(name));
    if (!item) continue;
    if (w.buy !== item.cost) report.priceDiffs.push({ name, ours: item.cost, wiki: w.buy as number });
    const ourRecipe = sorted(item.from.map((id) => nameOf.get(id) ?? id));
    const wikiRecipe = sorted(w.recipe ?? []);
    if (ourRecipe.join('|') !== wikiRecipe.join('|')) report.recipeDiffs.push({ name, ours: ourRecipe, wiki: wikiRecipe });

    // Text-only stats (e.g. "spec") and non-numbers are skipped; there's nothing to compare.
    const wikiStats = new Map<ItemStat, number>();
    for (const [k, v] of Object.entries(w.stats ?? {})) if (WIKI_STATS[k] && typeof v === 'number') wikiStats.set(WIKI_STATS[k], v);
    const labels = [...new Set([...Object.keys(item.stats), ...wikiStats.keys()])] as ItemStat[];
    const diffs = labels
      .filter((label) => item.stats[label] !== wikiStats.get(label))
      .map((label) => `${label}: ours ${item.stats[label] ?? 'none'}, wiki ${wikiStats.get(label) ?? 'none'}`);
    if (diffs.length) report.statDiffs.push({ name, diffs });
  }
  return report;
}
