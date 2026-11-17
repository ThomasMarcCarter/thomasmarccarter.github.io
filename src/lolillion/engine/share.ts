import { tiers, type TierName } from './tiers';

const MISS = '❌';

/** Spoiler-free result: score, one square per prompt, and the link. `null` is a miss. */
export function buildShareString(result: { number: number; tiers: (TierName | null)[] }, url: string): string {
  const byName = new Map(tiers.map((t) => [t.name, t]));
  const score = result.tiers.reduce((sum, name) => sum + (name ? byName.get(name)!.points : 0), 0);
  const max = result.tiers.length * Math.max(...tiers.map((t) => t.points));
  const squares = result.tiers.map((name) => (name ? byName.get(name)!.emoji : MISS)).join('');
  return `Lolillion #${result.number}  ${score}/${max}\n${squares}\n${url}`;
}
