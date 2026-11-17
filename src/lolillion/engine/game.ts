import type { Question } from '../data/questions';
import { scoreAnswer } from './score';

export const PROMPT_MS = 25_000;
const DAY_MS = 86_400_000;

export interface Answer {
  /** null when the time ran out. */
  entryId: string | null;
  /** What the player typed, for the results screen. */
  input: string;
}

export interface DayProgress {
  answers: Answer[];
  /** When the current prompt was shown (epoch ms), so a refresh can't reset the clock. */
  startedAt: number | null;
  /** The day's prompt ids, saved so a question update mid-day can't change prompts already being answered. */
  questionIds?: string[];
}

export interface Stats {
  played: number;
  streak: number;
  best: number;
  lastDay: string | null;
}

export const emptyProgress = (): DayProgress => ({ answers: [], startedAt: null });
export const emptyStats = (): Stats => ({ played: 0, streak: 0, best: 0, lastDay: null });

export function startPrompt(p: DayProgress, now: number): DayProgress {
  return { ...p, startedAt: now };
}

/** Records the answer to the running prompt; does nothing when no prompt is running (e.g. it already timed out). */
export function recordAnswer(p: DayProgress, entryId: string | null, input: string): DayProgress {
  if (p.startedAt === null) return p;
  return { ...p, answers: [...p.answers, { entryId, input }], startedAt: null };
}

/** Two tabs can hold different copies of today; the one further along wins, so no prompt can be replayed. */
export function mergeProgress(a: DayProgress, b: DayProgress): DayProgress {
  if (a.answers.length !== b.answers.length) return a.answers.length > b.answers.length ? a : b;
  return a.startedAt === null && b.startedAt !== null ? b : a;
}

export function remainingMs(p: DayProgress, now: number): number {
  return p.startedAt === null ? PROMPT_MS : Math.max(0, PROMPT_MS - (now - p.startedAt));
}

export function expireIfTimedOut(p: DayProgress, now: number): DayProgress {
  return p.startedAt !== null && remainingMs(p, now) === 0 ? recordAnswer(p, null, '') : p;
}

export function isFinished(p: DayProgress, total: number): boolean {
  return p.answers.length >= total;
}

export function totalLp(questions: Question[], p: DayProgress): number {
  return p.answers.reduce((sum, a, i) => sum + (questions[i] ? scoreAnswer(questions[i], a.entryId).points : 0), 0);
}

const previousDay = (day: string) => new Date(Date.parse(day) - DAY_MS).toISOString().slice(0, 10);

/** Records a finished day; calling it again for the same or an earlier day changes nothing. */
export function finishDay(stats: Stats, day: string, lp: number): Stats {
  // ISO dates compare as strings; an older day comes from a tab left open past midnight.
  if (stats.lastDay !== null && day <= stats.lastDay) return stats;
  return {
    played: stats.played + 1,
    streak: stats.lastDay === previousDay(day) ? stats.streak + 1 : 1,
    best: Math.max(stats.best, lp),
    lastDay: day,
  };
}

export function msUntilNextPuzzle(now: Date): number {
  const next = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1);
  return next - now.getTime();
}

/** The streak to show today: it survives until a whole UTC day is missed. */
export function currentStreak(stats: Stats, today: string): number {
  return stats.lastDay === today || stats.lastDay === previousDay(today) ? stats.streak : 0;
}
