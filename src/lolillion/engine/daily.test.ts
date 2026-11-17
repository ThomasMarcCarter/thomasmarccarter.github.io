import { describe, expect, it } from 'vitest';
import { getDailyQuestions, puzzleNumber, questionsForDay, utcDay } from './daily';

const ids = (d: Date) => getDailyQuestions(d).map((q) => q.id);

describe('utcDay', () => {
  it('uses the UTC calendar date, not the local one', () => {
    expect(utcDay(new Date('2026-11-17T23:30:00-05:00'))).toBe('2026-11-18');
    expect(utcDay(new Date('2026-11-18T00:30:00+02:00'))).toBe('2026-11-17');
  });
});

describe('puzzleNumber', () => {
  it('starts at 1 on launch day and counts UTC days', () => {
    expect(puzzleNumber(new Date('2026-11-17T12:00:00Z'))).toBe(1);
    expect(puzzleNumber(new Date('2026-11-18T00:00:00Z'))).toBe(2);
    expect(puzzleNumber(new Date('2027-11-17T00:00:00Z'))).toBe(366);
  });
});

describe('getDailyQuestions', () => {
  it('gives everyone the same 7 questions for a UTC day', () => {
    expect(ids(new Date('2026-12-01T00:01:00Z'))).toEqual(ids(new Date('2026-12-01T23:59:00Z')));
    expect(ids(new Date('2026-12-01T00:01:00Z'))).toHaveLength(7);
  });

  it('picks 4 champion and 3 item questions with no repeats', () => {
    const qs = getDailyQuestions(new Date('2026-12-01T12:00:00Z'));
    expect(qs.filter((q) => q.pool === 'champion')).toHaveLength(4);
    expect(qs.filter((q) => q.pool === 'item')).toHaveLength(3);
    expect(new Set(qs.map((q) => q.id)).size).toBe(7);
  });

  it('changes from day to day', () => {
    const sets = Array.from({ length: 30 }, (_, i) => ids(new Date(Date.UTC(2026, 11, 1 + i))).join());
    expect(new Set(sets).size).toBeGreaterThanOrEqual(25);
  });
});

describe('variety', () => {
  it('never repeats a question on consecutive days', () => {
    const repeats = Array.from({ length: 120 }, (_, i) => {
      const today = new Set(ids(new Date(Date.UTC(2026, 10, 17 + i))));
      return ids(new Date(Date.UTC(2026, 10, 18 + i))).filter((id) => today.has(id));
    }).flat();
    expect(repeats).toEqual([]);
  });
});

describe('questionsForDay', () => {
  const date = new Date('2026-12-01T12:00:00Z');
  it('uses the stored prompts so a later question update cannot change a day already started', () => {
    const stored = getDailyQuestions(new Date('2026-12-05T12:00:00Z')).map((q) => q.id);
    expect(questionsForDay(date, stored).map((q) => q.id)).toEqual(stored);
  });
  it('falls back to the daily pick when nothing is stored or a stored prompt no longer exists', () => {
    const today = getDailyQuestions(date).map((q) => q.id);
    expect(questionsForDay(date, undefined).map((q) => q.id)).toEqual(today);
    expect(questionsForDay(date, ['gone', ...today.slice(1)]).map((q) => q.id)).toEqual(today);
  });
});
