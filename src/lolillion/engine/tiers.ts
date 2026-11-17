// Rarity tiers, most common first. Tune names, points and cut-offs here without touching the scoring logic.
export type TierName = 'Silver' | 'Gold' | 'Platinum' | 'Diamond' | 'Master' | 'Challenger';

export interface Tier {
  name: TierName;
  meaning: string;
  points: number;
  /** Fraction of a prompt's valid answers in this tier, taken in popularity order. */
  share: number;
  /** Shown in the spoiler-free share string. */
  emoji: string;
}

// Challenger has no share of its own: it is always the single rarest answer, taken out of Master.
export const tiers: readonly Tier[] = [
  { name: 'Silver', meaning: 'Common', points: 10, share: 0.3, emoji: '⬜' },
  { name: 'Gold', meaning: 'Fairly common', points: 20, share: 0.25, emoji: '🟨' },
  { name: 'Platinum', meaning: 'Uncommon', points: 35, share: 0.2, emoji: '🟩' },
  { name: 'Diamond', meaning: 'Rare', points: 55, share: 0.15, emoji: '🟦' },
  { name: 'Master', meaning: 'Very rare', points: 75, share: 0.1, emoji: '🟪' },
  { name: 'Challenger', meaning: 'One in a million', points: 100, share: 0, emoji: '🟥' },
];
