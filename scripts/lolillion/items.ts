import { normalise } from '../../src/lolillion/normalise.ts';
import { ITEM_STATS, type Item, type ItemStat } from '../../src/lolillion/data/types.ts';

// Only the fields the build reads from Data Dragon's item.json.
export interface DdItem {
  name: string;
  description: string;
  colloq: string;
  gold: { base: number; total: number; sell: number; purchasable: boolean };
  tags: string[];
  maps: Record<string, boolean>;
  image: { full: string };
  from?: string[];
  into?: string[];
  inStore?: boolean;
  hideFromAll?: boolean;
  requiredChampion?: string;
  requiredAlly?: string;
}

export interface ItemBuildResult {
  items: Item[];
  missing: { id: string; fields: string[] }[];
  unknownStats: string[];
  unknownOverrides: string[];
}

const SUMMONERS_RIFT = '11';
const KNOWN_STATS = new Set<string>(ITEM_STATS);
const REQUIRED: (keyof Item)[] = [
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

/** Reads "<attention>25%</attention> Critical Strike Chance" pairs from an item description's <stats> block. */
export function parseStats(description: string): { stats: Partial<Record<ItemStat, number>>; unknown: string[] } {
  const block = description.match(/<stats>(.*?)<\/stats>/)?.[1] ?? '';
  const stats: Partial<Record<ItemStat, number>> = {};
  const unknown: string[] = [];
  for (const [, value, label] of block.matchAll(/<attention>\s*([\d.]+)%?\s*<\/attention>\s*([^<]+)/g)) {
    const name = label.trim();
    if (KNOWN_STATS.has(name)) stats[name as ItemStat] = Number(value);
    else unknown.push(name);
  }
  return { stats, unknown };
}

// Other modes copy items under 6-digit ids (e.g. 323003, 663039) that are sometimes wrongly flagged for the Rift.
const MAX_RIFT_ID_LENGTH = 4;

const buyableOnRift = (id: string, i: DdItem) =>
  id.length <= MAX_RIFT_ID_LENGTH &&
  i.maps[SUMMONERS_RIFT] &&
  i.gold.purchasable &&
  i.inStore !== false &&
  !i.hideFromAll &&
  !i.requiredChampion &&
  !i.requiredAlly;

// Riot's in-joke nicknames and shop search colours would look like bugs in autocomplete.
const IGNORED_NICKNAMES = new Set([
  'goldenarmofkobe',
  'goldenbicepofkobe',
  'hornofthemanwolf',
  'manwolf',
  'haroldandkumar',
  'banksys',
  'tonsofdamage',
  'white',
  'yellow',
  'orange',
  'noxian',
  'primal',
  'windblade',
  'canon',
  'dreadnought',
  'reverie',
  'nmst',
]);

const nicknames = (i: DdItem) =>
  i.colloq
    .split(';')
    .map(normalise)
    .filter((n) => n && !IGNORED_NICKNAMES.has(n));

export function buildItems(dd: Record<string, DdItem>, overrides: Record<string, Partial<Item>>): ItemBuildResult {
  // Some items appear twice under different ids; keep the lowest.
  const byName = new Map<string, string>();
  for (const [id, item] of Object.entries(dd)) {
    if (!buyableOnRift(id, item)) continue;
    const kept = byName.get(item.name);
    if (!kept || id < kept) byName.set(item.name, id);
  }
  const keptIds = new Set(byName.values());

  // Data Dragon nicknames double as shop search terms ("lethality", "dblade"); only unique ones work as answers.
  const nicknameUses = new Map<string, number>();
  for (const id of keptIds) for (const n of new Set(nicknames(dd[id]))) nicknameUses.set(n, (nicknameUses.get(n) ?? 0) + 1);
  const missing: ItemBuildResult['missing'] = [];
  const unknownStats = new Set<string>();

  const items = [...keptIds].sort().map((id) => {
    const source = dd[id];
    const override = overrides[id] ?? {};
    const { stats, unknown } = parseStats(source.description);
    unknown.forEach((s) => unknownStats.add(s));

    const item: Partial<Item> = {
      id,
      name: source.name,
      cost: source.gold.total,
      combineCost: source.gold.base,
      sell: source.gold.sell,
      stats,
      tags: source.tags,
      from: (source.from ?? []).filter((x) => keptIds.has(x)),
      into: (source.into ?? []).filter((x) => keptIds.has(x)),
      icon: source.image.full,
      ...override,
      aliases: [
        ...new Set(
          [
            normalise(source.name),
            ...nicknames(source).filter((n) => nicknameUses.get(n) === 1),
            ...(override.aliases ?? []).map(normalise),
          ].filter(Boolean),
        ),
      ],
    };

    const absent = REQUIRED.filter((field) => item[field] === undefined);
    if (absent.length) missing.push({ id, fields: absent });
    return item as Item;
  });

  const unknownOverrides = Object.keys(overrides).filter((id) => !keptIds.has(id));
  return { items, missing, unknownStats: [...unknownStats], unknownOverrides };
}
