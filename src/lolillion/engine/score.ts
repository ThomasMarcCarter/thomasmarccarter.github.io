import { validAnswers, type Question } from '../data/questions';
import type { Entry } from '../data/types';
import { tiers, type Tier } from './tiers';

// Cumulative shares as whole percents, so 0.75 * 6 rounds the same way every time.
const cumulativePercents = tiers.reduce<number[]>(
  (acc, t) => [...acc, (acc.at(-1) ?? 0) + Math.round(t.share * 100)],
  [],
);
const CHALLENGER = tiers.length - 1;
const MASTER = tiers.length - 2;

/** Tier for the answer at `index` (0 = most popular) out of `total` valid answers. */
export function tierForRank(index: number, total: number): Tier {
  if (index === total - 1) return tiers[CHALLENGER];
  const t = cumulativePercents.findIndex((pct, i) => i < MASTER && index < Math.round((pct * total) / 100));
  return tiers[t === -1 ? MASTER : t];
}

export function tierOf(question: Question, entryId: string): Tier | null {
  const answers = validAnswers(question);
  const index = answers.findIndex((a) => a.id === entryId);
  return index === -1 ? null : tierForRank(index, answers.length);
}

/** `entryId` is null when the player ran out of time. */
export function scoreAnswer(question: Question, entryId: string | null): { tier: Tier | null; points: number } {
  const tier = entryId === null ? null : tierOf(question, entryId);
  return { tier, points: tier?.points ?? 0 };
}

export function rarestAnswer(question: Question): Entry {
  return validAnswers(question).at(-1)!;
}
