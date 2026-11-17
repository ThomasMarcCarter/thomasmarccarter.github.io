import { tiers, type TierName } from './tiers';

const MISS = '❌';

/** Spoiler-free result: total LP, one square per prompt, and the link. `null` is a miss. */
export function buildShareString(result: { number: number; tiers: (TierName | null)[] }, url: string): string {
  const byName = new Map(tiers.map((t) => [t.name, t]));
  const score = result.tiers.reduce((sum, name) => sum + (name ? byName.get(name)!.points : 0), 0);
  const squares = result.tiers.map((name) => (name ? byName.get(name)!.emoji : MISS)).join('');
  return `Lolillion #${result.number}  ${score} LP\n${squares}\n${url}`;
}
