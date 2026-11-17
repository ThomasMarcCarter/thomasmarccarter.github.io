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

/** How many right answers are more popular than this one, as a whole percent (0 for the most popular). */
export function rarityPercent(question: Question, entryId: string): number {
  const answers = validAnswers(question);
  return Math.round((100 * answers.findIndex((a) => a.id === entryId)) / answers.length);
}

/** Wrong guesses don't end a prompt; only a right answer or the timer does. */
export function isRightAnswer(question: Question, entryId: string): boolean {
  return tierOf(question, entryId) !== null;
}

/** Every valid answer grouped by the tier it scores, rarest tier first, for the results breakdown. */
export function answersByTier(question: Question): { tier: Tier; entries: Entry[] }[] {
  const answers = validAnswers(question);
  const groups = new Map<Tier, Entry[]>();
  answers.forEach((entry, i) => {
    const tier = tierForRank(i, answers.length);
    groups.set(tier, [...(groups.get(tier) ?? []), entry]);
  });
  return [...tiers]
    .reverse()
    .filter((t) => groups.has(t))
    .map((tier) => ({ tier, entries: groups.get(tier)! }));
}
