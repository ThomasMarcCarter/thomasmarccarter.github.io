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
