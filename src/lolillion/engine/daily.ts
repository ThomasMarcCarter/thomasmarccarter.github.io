import { questions, type Question } from '../data/questions';

/** Puzzle #1. Move this to the real launch day before going live. */
export const LAUNCH_DATE = '2026-11-17';
const CHAMPION_PROMPTS = 4;
const ITEM_PROMPTS = 3;
const DAY_MS = 86_400_000;

/** The UTC calendar date, so every player gets the same puzzle at the same moment. */
export function utcDay(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function puzzleNumber(date: Date): number {
  return Math.floor((Date.parse(utcDay(date)) - Date.parse(LAUNCH_DATE)) / DAY_MS) + 1;
}

// FNV-1a: turns the date string into a 32-bit seed.
function hash(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return h >>> 0;
}

// mulberry32: small seeded generator, returns floats in [0, 1).
function seeded(seed: number): () => number {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(list: readonly T[], random: () => number): T[] {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function getDailyQuestions(date: Date): Question[] {
  const random = seeded(hash(utcDay(date)));
  const pick = (pool: Question['pool'], count: number) =>
    shuffle(
      questions.filter((q) => q.pool === pool),
      random,
    ).slice(0, count);
  return shuffle([...pick('champion', CHAMPION_PROMPTS), ...pick('item', ITEM_PROMPTS)], random);
}
