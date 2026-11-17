// Every prompt is a predicate over the data, so valid answers are always derived, never hand-listed.
import championData from './champions.json';
import itemData from './items.json';
import type {
  Champion,
  ChampionClass,
  ChampionData,
  Entry,
  Item,
  ItemData,
  ItemStat,
  Position,
  Region,
} from './types';

export const champions = (championData as ChampionData).champions;
export const items = (itemData as ItemData).items;

interface QuestionBase {
  id: string;
  prompt: string;
}
export type ChampionQuestion = QuestionBase & { pool: 'champion'; match: (c: Champion) => boolean };
export type ItemQuestion = QuestionBase & { pool: 'item'; match: (i: Item) => boolean };
export type Question = ChampionQuestion | ItemQuestion;

const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
const champion = (id: string, prompt: string, match: (c: Champion) => boolean): ChampionQuestion => ({
  id,
  prompt,
  pool: 'champion',
  match,
});
const item = (id: string, prompt: string, match: (i: Item) => boolean): ItemQuestion => ({ id, prompt, pool: 'item', match });

// ---------- Champions ----------

const positionPrompts: Record<Position, string> = {
  Top: 'a top laner',
  Jungle: 'a jungler',
  Mid: 'a mid laner',
  Bot: 'a bot laner',
  Support: 'a support',
};

const regionPrompts: Record<Region, string> = {
  'Bandle City': 'from Bandle City',
  Bilgewater: 'from Bilgewater',
  Demacia: 'from Demacia',
  Freljord: 'from the Freljord',
  Ionia: 'from Ionia',
  Ixtal: 'from Ixtal',
  Noxus: 'from Noxus',
  Piltover: 'from Piltover',
  'Shadow Isles': 'from the Shadow Isles',
  Shurima: 'from Shurima',
  Targon: 'from Mount Targon',
  'the Void': 'from the Void',
  Zaun: 'from Zaun',
  Runeterra: 'not tied to any one region',
};

const classPrompts: Record<ChampionClass, string> = {
  Assassin: 'an assassin',
  Fighter: 'a fighter',
  Mage: 'a mage',
  Marksman: 'a marksman',
  Tank: 'a tank',
  Support: 'a champion classed as a support',
};

const speciesPrompts: Record<string, string> = {
  Human: 'a human champion',
  Yordle: 'a yordle',
  Vastaya: 'a vastaya',
  Undead: 'an undead champion',
  'Void-born': 'a Void-born champion',
};

const regionClassCombos: [Region, ChampionClass][] = [
  ['Ionia', 'Mage'],
  ['Ionia', 'Assassin'],
  ['Ionia', 'Fighter'],
  ['Noxus', 'Fighter'],
  ['Noxus', 'Assassin'],
  ['Noxus', 'Mage'],
  ['Demacia', 'Mage'],
  ['Demacia', 'Fighter'],
  ['Demacia', 'Tank'],
  ['Freljord', 'Tank'],
  ['Freljord', 'Fighter'],
  ['Zaun', 'Tank'],
  ['Zaun', 'Mage'],
  ['the Void', 'Mage'],
  ['Bandle City', 'Mage'],
];

const regionAdjectives: Partial<Record<Region, string>> = {
  Ionia: 'an Ionian',
  Noxus: 'a Noxian',
  Demacia: 'a Demacian',
  Freljord: 'a Freljordian',
  Zaun: 'a Zaunite',
  'the Void': 'a Void',
  'Bandle City': 'a Bandle City',
};

const nameLetters = ['S', 'A', 'K', 'T', 'R', 'V', 'L', 'M', 'N', 'Z', 'G', 'B', 'J'];

const championQuestions: ChampionQuestion[] = [
  ...Object.entries(positionPrompts).map(([p, text]) =>
    champion(`pos-${slug(p)}`, `Name ${text}`, (c) => c.positions.includes(p as Position)),
  ),
  ...Object.entries(regionPrompts).map(([r, text]) =>
    champion(`region-${slug(r)}`, `Name a champion ${text}`, (c) => c.region === r),
  ),
  ...Object.entries(classPrompts).map(([k, text]) =>
    champion(`class-${slug(k)}`, `Name ${text}`, (c) => c.classes.includes(k as ChampionClass)),
  ),
  ...Object.entries(speciesPrompts).map(([s, text]) =>
    champion(`species-${slug(s)}`, `Name ${text}`, (c) => c.species.includes(s)),
  ),
  champion('resource-manaless', 'Name a champion that doesn’t use mana', (c) => c.resource !== 'Mana'),
  champion('resource-energy', 'Name a champion that uses energy', (c) => c.resource === 'Energy'),
  champion('range-melee', 'Name a melee champion', (c) => c.rangeType === 'Melee'),
  champion('range-ranged', 'Name a ranged champion', (c) => c.rangeType === 'Ranged'),
  champion('release-2009', 'Name a champion released in 2009', (c) => c.releaseYear === 2009),
  champion('release-before-2011', 'Name a champion released before 2011', (c) => c.releaseYear < 2011),
  champion('release-2020-on', 'Name a champion released in 2020 or later', (c) => c.releaseYear >= 2020),
  ...nameLetters.map((l) =>
    champion(`name-starts-${l.toLowerCase()}`, `Name a champion whose name starts with ${l}`, (c) => c.name.startsWith(l)),
  ),
  champion('name-apostrophe', 'Name a champion with an apostrophe in their name', (c) => c.name.includes("'")),
  champion('name-space', 'Name a champion with more than one word in their name', (c) => c.name.includes(' ')),
  champion('gender-female', 'Name a female champion', (c) => c.gender === 'Female'),
  champion('gender-male', 'Name a male champion', (c) => c.gender === 'Male'),
  ...regionClassCombos.map(([r, k]) =>
    champion(
      `combo-${slug(r)}-${slug(k)}`,
      `Name ${regionAdjectives[r]} ${classPrompts[k].replace(/^an? /, '')}`,
      (c) => c.region === r && c.classes.includes(k),
    ),
  ),
  champion('combo-ranged-top', 'Name a ranged top laner', (c) => c.positions.includes('Top') && c.rangeType === 'Ranged'),
  champion('combo-ranged-jungle', 'Name a ranged jungler', (c) => c.positions.includes('Jungle') && c.rangeType === 'Ranged'),
  champion('combo-melee-mid', 'Name a melee mid laner', (c) => c.positions.includes('Mid') && c.rangeType === 'Melee'),
  champion('combo-melee-support', 'Name a melee support', (c) => c.positions.includes('Support') && c.rangeType === 'Melee'),
  ...moreChampionQuestions(),
];

// ---------- More champion prompts ----------

function moreChampionQuestions(): ChampionQuestion[] {
  const has = (c: Champion, k: ChampionClass) => c.classes.includes(k);
  const plays = (c: Champion, p: Position) => c.positions.includes(p);
  const years: [string, string, (y: number) => boolean][] = [
    ['2010', 'in 2010', (y) => y === 2010],
    ['2011', 'in 2011', (y) => y === 2011],
    ['2012', 'in 2012', (y) => y === 2012],
    ['2013-2016', 'between 2013 and 2016', (y) => y >= 2013 && y <= 2016],
    ['2017-2019', 'between 2017 and 2019', (y) => y >= 2017 && y <= 2019],
  ];
  const femaleRoles: [string, string, (c: Champion) => boolean][] = [
    ['assassin', 'a female assassin', (c) => has(c, 'Assassin')],
    ['mage', 'a female mage', (c) => has(c, 'Mage')],
    ['marksman', 'a female marksman', (c) => has(c, 'Marksman')],
    ['fighter', 'a female fighter', (c) => has(c, 'Fighter')],
    ['top', 'a female top laner', (c) => plays(c, 'Top')],
    ['jungle', 'a female jungler', (c) => plays(c, 'Jungle')],
    ['support', 'a female support', (c) => plays(c, 'Support')],
  ];
  const classPairs: [ChampionClass, ChampionClass, string][] = [
    ['Mage', 'Support', 'a champion who is both a mage and a support'],
    ['Fighter', 'Tank', 'a champion who is both a fighter and a tank'],
    ['Fighter', 'Assassin', 'a champion who is both a fighter and an assassin'],
    ['Mage', 'Assassin', 'a champion who is both a mage and an assassin'],
    ['Marksman', 'Mage', 'a champion who is both a marksman and a mage'],
  ];
  const roleClass: [Position, ChampionClass, string][] = [
    ['Jungle', 'Assassin', 'an assassin who plays jungle'],
    ['Jungle', 'Tank', 'a tank who plays jungle'],
    ['Top', 'Tank', 'a tank who plays top'],
    ['Mid', 'Assassin', 'an assassin who plays mid'],
    ['Support', 'Tank', 'a tank who plays support'],
    ['Support', 'Mage', 'a mage who plays support'],
    ['Bot', 'Mage', 'a mage who plays bot lane'],
  ];
  const regionRole: [Region, Position][] = [
    ['Ionia', 'Mid'],
    ['Ionia', 'Top'],
    ['Demacia', 'Top'],
    ['Noxus', 'Top'],
    ['Freljord', 'Jungle'],
  ];
  return [
    ...years.map(([id, text, test]) =>
      champion(`release-${id}`, `Name a champion released ${text}`, (c) => test(c.releaseYear)),
    ),
    ...femaleRoles.map(([id, text, test]) =>
      champion(`gender-female-${id}`, `Name ${text}`, (c) => c.gender === 'Female' && test(c)),
    ),
    ...classPairs.map(([a, b, text]) =>
      champion(`class-${slug(a)}-${slug(b)}`, `Name ${text}`, (c) => has(c, a) && has(c, b)),
    ),
    ...roleClass.map(([p, k, text]) =>
      champion(`role-${slug(p)}-${slug(k)}`, `Name ${text}`, (c) => plays(c, p) && has(c, k)),
    ),
    ...regionRole.map(([r, p]) =>
      champion(
        `region-${slug(r)}-${slug(p)}`,
        `Name ${regionAdjectives[r] ?? `a ${r}`} ${positionPrompts[p].replace(/^an? /, '')}`,
        (c) => c.region === r && plays(c, p),
      ),
    ),
    champion('combo-melee-mage', 'Name a melee mage', (c) => has(c, 'Mage') && c.rangeType === 'Melee'),
    champion('combo-yordle-mage', 'Name a yordle mage', (c) => c.species.includes('Yordle') && has(c, 'Mage')),
    champion('name-short', 'Name a champion with 4 letters or fewer in their name', (c) => c.name.replace(/[^A-Za-z]/g, '').length <= 4),
    champion('name-long', 'Name a champion with 9 or more letters in their name', (c) => c.name.replace(/[^A-Za-z]/g, '').length >= 9),
    champion('name-ends-a', 'Name a champion whose name ends in A', (c) => /a$/i.test(c.name)),
    champion('name-has-z', 'Name a champion with a Z in their name', (c) => /z/i.test(c.name)),
    champion('name-starts-c-d-e', 'Name a champion whose name starts with C, D or E', (c) => /^[CDE]/.test(c.name)),
  ];
}

// ---------- Items ----------

const statQuestions: ItemStat[] = [
  'Health',
  'Attack Damage',
  'Ability Haste',
  'Ability Power',
  'Move Speed',
  'Attack Speed',
  'Armor',
  'Magic Resist',
  'Base Mana Regen',
  'Critical Strike Chance',
  'Mana',
  'Base Health Regen',
  'Lethality',
  'Life Steal',
  'Heal and Shield Power',
  'Magic Penetration',
  'Omnivamp',
];

// How players say it, where Data Dragon's label differs.
const statWording: Partial<Record<ItemStat, string>> = {
  'Base Mana Regen': 'Mana Regen',
  'Base Health Regen': 'Health Regen',
};

// Components that build directly into at least six items.
const components = [
  'Long Sword',
  'Ruby Crystal',
  'Pickaxe',
  'Amplifying Tome',
  'Kindlegem',
  "Caulfield's Warhammer",
  'Blasting Wand',
  'Cloth Armor',
  'Dagger',
  'Glowing Mote',
  "Giant's Belt",
  'Null-Magic Mantle',
  'Fiendish Codex',
  'Tunneler',
  'Cloak of Agility',
  'Chain Vest',
  'Serrated Dirk',
  'Recurve Bow',
  'Aether Wisp',
  'Forbidden Idol',
  "Scout's Slingshot",
];
const idOf = (name: string) => {
  const found = items.find((i) => i.name === name);
  if (!found) throw new Error(`No item named ${name}`);
  return found.id;
};

const statCostCombos: [ItemStat, 'over' | 'under'][] = [
  ['Attack Damage', 'over'],
  ['Health', 'over'],
  ['Ability Haste', 'over'],
  ['Ability Power', 'over'],
  ['Attack Speed', 'over'],
  ['Critical Strike Chance', 'over'],
  ['Ability Haste', 'under'],
  ['Lethality', 'under'],
];

const PRICEY = 3000;
// Data Dragon leaves the Boots tag off some upgraded boots (Gunmetal Greaves), so also count anything built from boots.
const bootIds = new Set(items.filter((i) => i.tags.includes('Boots')).map((i) => i.id));
const isBoots = (i: Item) => bootIds.has(i.id) || i.from.some((id) => bootIds.has(id));
const hasStat = (i: Item, s: ItemStat) => i.stats[s] !== undefined;

const itemQuestions: ItemQuestion[] = [
  ...statQuestions.map((s) =>
    item(`item-stat-${slug(s)}`, `Name an item that gives ${statWording[s] ?? s}`, (i) => hasStat(i, s)),
  ),
  item('item-cost-3000-plus', `Name an item that costs ${PRICEY} gold or more`, (i) => i.cost >= PRICEY),
  item('item-cost-under-1000', 'Name an item that costs less than 1000 gold', (i) => i.cost < 1000),
  item('item-cost-2500s', 'Name an item that costs from 2500 to 2999 gold', (i) => i.cost >= 2500 && i.cost < PRICEY),
  item('item-sell-2000-plus', 'Name an item that sells for 2000 gold or more', (i) => i.sell >= 2000),
  ...components.map((name) => {
    const id = idOf(name);
    return item(`item-from-${slug(name)}`, `Name an item built directly from ${name}`, (i) => i.from.includes(id));
  }),
  item('item-boots', 'Name a pair of boots', isBoots),
  item('item-consumable', 'Name a consumable', (i) => i.tags.includes('Consumable')),
  ...statCostCombos.map(([s, band]) =>
    item(
      `item-combo-${slug(s)}-${band}-${PRICEY}`,
      `Name an item that gives ${s} and costs ${band === 'over' ? `${PRICEY} gold or more` : `less than ${PRICEY} gold`}`,
      (i) => hasStat(i, s) && (band === 'over' ? i.cost >= PRICEY : i.cost < PRICEY),
    ),
  ),
  ...moreItemQuestions(),
];

// ---------- More item prompts ----------

function moreItemQuestions(): ItemQuestion[] {
  const statPairs: [ItemStat, ItemStat][] = [
    ['Attack Damage', 'Health'],
    ['Ability Power', 'Health'],
    ['Ability Power', 'Mana'],
    ['Armor', 'Health'],
    ['Magic Resist', 'Health'],
    ['Attack Speed', 'Critical Strike Chance'],
    ['Attack Damage', 'Ability Haste'],
    ['Ability Power', 'Ability Haste'],
    ['Health', 'Ability Haste'],
    ['Attack Speed', 'Move Speed'],
  ];
  const word = (s: ItemStat) => (statWording[s] ?? s);
  return [
    ...statPairs.map(([a, b]) =>
      item(
        `item-pair-${slug(a)}-${slug(b)}`,
        `Name an item that gives both ${word(a)} and ${word(b)}`,
        (i) => hasStat(i, a) && hasStat(i, b),
      ),
    ),
    item('item-cost-1000s', 'Name an item that costs from 1000 to 1999 gold', (i) => i.cost >= 1000 && i.cost < 2000),
    item('item-cost-2000s', 'Name an item that costs from 2000 to 2499 gold', (i) => i.cost >= 2000 && i.cost < 2500),
    item('item-cost-under-500', 'Name an item that costs less than 500 gold', (i) => i.cost < 500),
    item('item-active', 'Name an item with an active you can use', (i) => i.tags.includes('Active')),
    item('item-jungle', 'Name a jungle item', (i) => i.tags.includes('Jungle')),
    item('item-starter', 'Name a starting item', (i) => i.tags.includes('Lane') && i.cost <= 500 && i.from.length === 0),
    item('item-vision', 'Name an item that helps with vision', (i) => i.tags.includes('Vision')),
    item('item-slow', 'Name an item that slows enemies', (i) => i.tags.includes('Slow')),
    item('item-on-hit', 'Name an item with an on-hit effect', (i) => i.tags.includes('OnHit')),
    item('item-gold', 'Name an item that earns you gold', (i) => i.tags.includes('GoldPer')),
    item('item-finished-under-2500', 'Name a finished item that costs less than 2500 gold', (i) => i.into.length === 0 && i.from.length > 0 && i.cost < 2500 && !isBoots(i)),
  ];
}

export const questions: Question[] = [...championQuestions, ...itemQuestions];

/** Every entry that answers the question, most popular first. */
export function validAnswers(q: Question): Entry[] {
  const answers = q.pool === 'champion' ? champions.filter(q.match) : items.filter(q.match);
  return answers.sort((a, b) => a.popularity - b.popularity);
}
