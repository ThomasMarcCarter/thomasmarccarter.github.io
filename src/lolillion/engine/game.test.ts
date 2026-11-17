import { describe, expect, it } from 'vitest';
import { getDailyQuestions } from './daily';
import { validAnswers } from '../data/questions';
import {
  PROMPT_MS,
  currentStreak,
  emptyProgress,
  expireIfTimedOut,
  finishDay,
  isFinished,
  msUntilNextPuzzle,
  recordAnswer,
  remainingMs,
  startPrompt,
  totalLp,
  type Stats,
} from './game';

const T0 = Date.UTC(2026, 11, 1, 12);

describe('prompt timer', () => {
  it('keeps counting from when the prompt was shown', () => {
    const p = startPrompt(emptyProgress(), T0);
    expect(remainingMs(p, T0 + 10_000)).toBe(15_000);
    expect(remainingMs(p, T0 + 40_000)).toBe(0);
  });

  it('records a timeout once the time is up, and not before', () => {
    const p = startPrompt(emptyProgress(), T0);
    expect(expireIfTimedOut(p, T0 + PROMPT_MS - 1)).toEqual(p);
    expect(expireIfTimedOut(p, T0 + PROMPT_MS)).toEqual({ answers: [{ entryId: null, input: '' }], startedAt: null });
  });

  it('leaves progress alone when no prompt is running', () => {
    expect(expireIfTimedOut(emptyProgress(), T0)).toEqual(emptyProgress());
  });
});

describe('answers', () => {
  it('records an answer and stops the clock', () => {
    const p = recordAnswer(startPrompt(emptyProgress(), T0), 'Garen', 'garen');
    expect(p).toEqual({ answers: [{ entryId: 'Garen', input: 'garen' }], startedAt: null });
  });

  it('finishes after every prompt has an answer', () => {
    let p = emptyProgress();
    for (let i = 0; i < 7; i++) p = recordAnswer(p, null, '');
    expect(isFinished(p, 7)).toBe(true);
    expect(isFinished(recordAnswer(emptyProgress(), null, ''), 7)).toBe(false);
  });

  it('adds up LP from each answer tier', () => {
    const qs = getDailyQuestions(new Date(T0));
    const rarest = qs.map((q) => validAnswers(q).at(-1)!.id);
    let p = emptyProgress();
    for (const id of rarest) p = recordAnswer(p, id, id);
    expect(totalLp(qs, p)).toBe(700);
    expect(totalLp(qs, emptyProgress())).toBe(0);
  });
});

describe('finishDay', () => {
  const fresh: Stats = { played: 0, streak: 0, best: 0, lastDay: null };

  it('starts a streak on the first play', () => {
    expect(finishDay(fresh, '2026-12-01', 200)).toEqual({ played: 1, streak: 1, best: 200, lastDay: '2026-12-01' });
  });

  it('extends the streak on the next day and keeps the best score', () => {
    const day1 = finishDay(fresh, '2026-12-01', 200);
    expect(finishDay(day1, '2026-12-02', 150)).toEqual({ played: 2, streak: 2, best: 200, lastDay: '2026-12-02' });
  });

  it('resets the streak after a missed day', () => {
    const day1 = finishDay(fresh, '2026-12-01', 200);
    expect(finishDay(day1, '2026-12-03', 300).streak).toBe(1);
  });

  it('counts the same day only once', () => {
    const day1 = finishDay(fresh, '2026-12-01', 200);
    expect(finishDay(day1, '2026-12-01', 200)).toEqual(day1);
  });
});

describe('msUntilNextPuzzle', () => {
  it('counts down to the next UTC midnight', () => {
    expect(msUntilNextPuzzle(new Date('2026-12-01T23:00:00Z'))).toBe(3_600_000);
  });
});

describe('currentStreak', () => {
  const stats: Stats = { played: 5, streak: 4, best: 300, lastDay: '2026-12-01' };
  it('shows the streak while it is still alive', () => {
    expect(currentStreak(stats, '2026-12-01')).toBe(4);
    expect(currentStreak(stats, '2026-12-02')).toBe(4);
  });
  it('shows 0 once a day has been missed', () => {
    expect(currentStreak(stats, '2026-12-03')).toBe(0);
  });
});
