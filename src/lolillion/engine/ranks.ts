// The day's final rank from total LP: a new rank every 100 LP, with Challenger kept for a perfect day.
export interface Rank {
  name: string;
  /** Lowest total LP for this rank. */
  min: number;
}

export const ranks: readonly Rank[] = [
  { name: 'Iron', min: 0 },
  { name: 'Bronze', min: 100 },
  { name: 'Silver', min: 200 },
  { name: 'Gold', min: 300 },
  { name: 'Platinum', min: 400 },
  { name: 'Diamond', min: 500 },
  { name: 'Master', min: 600 },
  { name: 'Challenger', min: 700 },
];

export function finalRank(lp: number): Rank {
  return ranks.findLast((r) => lp >= r.min) ?? ranks[0];
}

export function nextRank(lp: number): Rank | null {
  return ranks.find((r) => r.min > lp) ?? null;
}
