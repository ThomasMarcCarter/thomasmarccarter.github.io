export const POSITIONS = ['Top', 'Jungle', 'Mid', 'Bot', 'Support'] as const;
export const CLASSES = ['Assassin', 'Fighter', 'Mage', 'Marksman', 'Support', 'Tank'] as const;
export const REGIONS = [
  'Bandle City',
  'Bilgewater',
  'Demacia',
  'Freljord',
  'Ionia',
  'Ixtal',
  'Noxus',
  'Piltover',
  'Shadow Isles',
  'Shurima',
  'Targon',
  'the Void',
  'Zaun',
  'Runeterra',
] as const;
export const GENDERS = ['Male', 'Female', 'Other'] as const;
export const RANGE_TYPES = ['Melee', 'Ranged'] as const;

export type Position = (typeof POSITIONS)[number];
export type ChampionClass = (typeof CLASSES)[number];
export type Region = (typeof REGIONS)[number];
export type Gender = (typeof GENDERS)[number];
export type RangeType = (typeof RANGE_TYPES)[number];

export interface Champion {
  id: string;
  name: string;
  /** Normalised spellings that match this champion, including its name. */
  aliases: string[];
  positions: Position[];
  classes: ChampionClass[];
  region: Region;
  species: string[];
  resource: string;
  rangeType: RangeType;
  gender: Gender;
  releaseYear: number;
  /** 1 is the most played champion; ranks are unique. */
  popularity: number;
  /** File name on the Data Dragon CDN, under img/champion/. */
  icon: string;
}

export interface ChampionData {
  ddragonVersion: string;
  champions: Champion[];
}

export const ITEM_STATS = [
  'Attack Damage',
  'Ability Power',
  'Health',
  'Mana',
  'Armor',
  'Magic Resist',
  'Attack Speed',
  'Critical Strike Chance',
  'Critical Strike Damage',
  'Lethality',
  'Armor Penetration',
  'Magic Penetration',
  'Ability Haste',
  'Life Steal',
  'Omnivamp',
  'Move Speed',
  'Base Health Regen',
  'Base Mana Regen',
  'Heal and Shield Power',
  'Tenacity',
  'Gold Per 10 Seconds',
  'Adaptive Force',
] as const;
export type ItemStat = (typeof ITEM_STATS)[number];

export interface Item {
  /** Data Dragon item key, e.g. "3031". */
  id: string;
  name: string;
  /** Normalised spellings that match this item, including its name. */
  aliases: string[];
  /** Total price in gold. */
  cost: number;
  /** Gold paid on top of the components. */
  combineCost: number;
  sell: number;
  /** Percent stats are stored as whole numbers: 25 means 25%. */
  stats: Partial<Record<ItemStat, number>>;
  tags: string[];
  /** Ids of the items this one builds from and into. */
  from: string[];
  into: string[];
  /** 1 is the most bought item; ranks are unique. */
  popularity: number;
  /** File name on the Data Dragon CDN, under img/item/. */
  icon: string;
}

export interface ItemData {
  ddragonVersion: string;
  items: Item[];
}

/** What the engine needs from any answer, champion or item. */
export type Entry = Pick<Champion, 'id' | 'name' | 'aliases' | 'popularity' | 'icon'>;
