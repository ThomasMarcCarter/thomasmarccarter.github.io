import { describe, expect, it } from 'vitest';
import { finalRank, nextRank } from './ranks';

describe('finalRank', () => {
  it('moves up one rank every 100 LP', () => {
    expect([0, 99, 100, 250, 399, 400, 599, 600, 699].map((lp) => finalRank(lp).name)).toEqual([
      'Iron',
      'Iron',
      'Bronze',
      'Silver',
      'Gold',
      'Platinum',
      'Diamond',
      'Master',
      'Master',
    ]);
  });
  it('saves Challenger for a perfect 700', () => {
    expect(finalRank(700).name).toBe('Challenger');
  });
});

describe('nextRank', () => {
  it('names the next rank and the LP it starts at', () => {
    expect(nextRank(250)).toEqual({ name: 'Gold', min: 300 });
    expect(nextRank(650)).toEqual({ name: 'Challenger', min: 700 });
  });
  it('is null at the top', () => {
    expect(nextRank(700)).toBeNull();
  });
});
