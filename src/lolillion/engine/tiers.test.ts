import { describe, expect, it } from 'vitest';
import { tiers } from './tiers';

describe('tiers', () => {
  it('lists the six ranks in order', () => {
    expect(tiers.map((t) => t.name)).toEqual(['Silver', 'Gold', 'Platinum', 'Diamond', 'Master', 'Challenger']);
  });
  it('awards the planned points, rising with rarity', () => {
    expect(tiers.map((t) => t.points)).toEqual([20, 40, 50, 75, 90, 100]);
  });
  it('splits all valid answers between the tiers', () => {
    expect(tiers.reduce((sum, t) => sum + t.share, 0)).toBeCloseTo(1);
  });
  it('gives each tier its own emoji', () => {
    expect(new Set(tiers.map((t) => t.emoji)).size).toBe(tiers.length);
  });
});
