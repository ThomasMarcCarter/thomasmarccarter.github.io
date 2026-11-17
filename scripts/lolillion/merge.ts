import { normalise } from '../../src/lolillion/normalise.ts';
import type { Champion, ChampionClass, Position, RangeType, Region } from '../../src/lolillion/data/types.ts';

// Only the fields the merge reads from each source.
export interface DdChampion {
  id: string;
  name: string;
  tags: string[];
  partype: string;
  stats: { attackrange: number };
  image: { full: string };
}
export interface MerakiChampion {
  positions: string[];
  attackType: string;
  releaseDate: string;
}
export interface UniverseChampion {
  name: string;
  'associated-faction-slug': string;
  'release-date': string;
}
export interface Sources {
  ddragon: DdChampion[];
  meraki: Record<string, MerakiChampion>;
  universe: UniverseChampion[];
}

export interface MergeResult {
  /** Champions with missing fields are still returned, without those fields, so the report can list them. */
  champions: Champion[];
  missing: { id: string; fields: string[] }[];
  conflicts: { id: string; field: string; values: Record<string, unknown> }[];
  unknownOverrides: string[];
}

const REGION_BY_SLUG: Record<string, Region> = {
  'bandle-city': 'Bandle City',
  bilgewater: 'Bilgewater',
  demacia: 'Demacia',
  freljord: 'Freljord',
  ionia: 'Ionia',
  ixtal: 'Ixtal',
  noxus: 'Noxus',
  piltover: 'Piltover',
  'shadow-isles': 'Shadow Isles',
  shurima: 'Shurima',
  'mount-targon': 'Targon',
  void: 'the Void',
  zaun: 'Zaun',
  unaffiliated: 'Runeterra',
};

const POSITION_BY_MERAKI: Record<string, Position> = {
  TOP: 'Top',
  JUNGLE: 'Jungle',
  MIDDLE: 'Mid',
  BOTTOM: 'Bot',
  SUPPORT: 'Support',
};

const REQUIRED: (keyof Champion)[] = [
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

// "Dr" or "IV" alone are too short to mean anyone.
const MIN_WORD_ALIAS = 3;

// Melee champions' basic attack range tops out at 250 in Data Dragon; ranged starts well above.
const MELEE_MAX_RANGE = 300;

export function mergeChampions(src: Sources, overrides: Record<string, Partial<Champion>>): MergeResult {
  const universeByName = new Map(src.universe.map((u) => [normalise(u.name), u]));
  const missing: MergeResult['missing'] = [];
  const conflicts: MergeResult['conflicts'] = [];

  // Single words of multi-word names ("kench", "willump") are answers too, unless two champions share one.
  const wordsOf = (name: string) =>
    name.includes(' ') ? name.split(/[\s.&]+/).map(normalise).filter((w) => w.length >= MIN_WORD_ALIAS) : [];
  const wordUses = new Map<string, number>();
  for (const dd of src.ddragon) for (const w of new Set(wordsOf(dd.name))) wordUses.set(w, (wordUses.get(w) ?? 0) + 1);
  const fullNames = new Set(src.ddragon.flatMap((dd) => [normalise(dd.name), normalise(dd.id)]));
  const wordAliases = (name: string) => wordsOf(name).filter((w) => wordUses.get(w) === 1 && !fullNames.has(w));

  const champions = [...src.ddragon]
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((dd) => {
      const meraki = src.meraki[dd.id];
      const universe = universeByName.get(normalise(dd.name));
      const override = overrides[dd.id] ?? {};

      const ddRange: RangeType = dd.stats.attackrange < MELEE_MAX_RANGE ? 'Melee' : 'Ranged';
      const merakiRange = meraki && (meraki.attackType === 'RANGED' ? 'Ranged' : 'Melee');
      if (merakiRange && merakiRange !== ddRange) {
        conflicts.push({ id: dd.id, field: 'rangeType', values: { meraki: merakiRange, ddragon: ddRange } });
      }

      const merakiYear = meraki && Number(meraki.releaseDate.slice(0, 4));
      const universeYear = universe && Number(universe['release-date'].slice(0, 4));
      if (merakiYear && universeYear && merakiYear !== universeYear) {
        conflicts.push({ id: dd.id, field: 'releaseYear', values: { meraki: merakiYear, universe: universeYear } });
      }

      const champion: Partial<Champion> = {
        id: dd.id,
        name: dd.name,
        positions: meraki?.positions.map((p) => POSITION_BY_MERAKI[p]),
        classes: dd.tags as ChampionClass[],
        region: universe && REGION_BY_SLUG[universe['associated-faction-slug']],
        resource: dd.partype || 'None',
        rangeType: merakiRange ?? ddRange,
        releaseYear: merakiYear || universeYear,
        icon: dd.image.full,
        ...override,
        aliases: [
          ...new Set([
            normalise(dd.name),
            normalise(dd.id),
            normalise(dd.name.replace(/&/g, 'and')),
            ...wordAliases(dd.name),
            ...(override.aliases ?? []).map(normalise),
          ]),
        ],
      };

      const absent = REQUIRED.filter((field) => {
        const value = champion[field];
        return value === undefined || (Array.isArray(value) && value.length === 0);
      });
      if (absent.length) missing.push({ id: dd.id, fields: absent });

      return champion as Champion;
    });

  const ids = new Set(src.ddragon.map((c) => c.id));
  const unknownOverrides = Object.keys(overrides).filter((id) => !ids.has(id));

  return { champions, missing, conflicts, unknownOverrides };
}
