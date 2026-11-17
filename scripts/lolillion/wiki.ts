// Cross-check our item data against a locally saved copy of the League of Legends Wiki's Module:ItemData/data.
// The wiki blocks scripted downloads, so the file is saved by hand and kept out of git (its text is CC BY-SA).
import type { Item } from '../../src/lolillion/data/types.ts';

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

type WikiItem = { modes?: Record<string, boolean>; buy?: number; recipe?: string[] };

export interface WikiReport {
  /** On the wiki's Summoner's Rift list but not in ours. */
  missingFromOurs: string[];
  /** In ours but not sold on the Rift according to the wiki. */
  notOnWikiRift: string[];
  priceDiffs: { name: string; ours: number; wiki: number }[];
  recipeDiffs: { name: string; ours: string[]; wiki: string[] }[];
}

const SUMMONERS_RIFT = 'classic sr 5v5';

export function compareWithWiki(items: readonly Item[], wiki: Record<string, Record<string, unknown>>): WikiReport {
  const onRift = new Map(
    Object.entries(wiki as Record<string, WikiItem>).filter(([, w]) => w.modes?.[SUMMONERS_RIFT] && (w.buy ?? 0) > 0),
  );
  const ours = new Map(items.map((i) => [i.name, i]));
  const nameOf = new Map(items.map((i) => [i.id, i.name]));
  const sorted = (names: string[]) => [...names].sort();

  const report: WikiReport = {
    missingFromOurs: [...onRift.keys()].filter((name) => !ours.has(name)).sort(),
    notOnWikiRift: items.filter((i) => !onRift.has(i.name)).map((i) => i.name).sort(),
    priceDiffs: [],
    recipeDiffs: [],
  };
  for (const [name, w] of onRift) {
    const item = ours.get(name);
    if (!item) continue;
    if (w.buy !== item.cost) report.priceDiffs.push({ name, ours: item.cost, wiki: w.buy! });
    const ourRecipe = sorted(item.from.map((id) => nameOf.get(id) ?? id));
    const wikiRecipe = sorted(w.recipe ?? []);
    if (ourRecipe.join('|') !== wikiRecipe.join('|')) report.recipeDiffs.push({ name, ours: ourRecipe, wiki: wikiRecipe });
  }
  return report;
}
