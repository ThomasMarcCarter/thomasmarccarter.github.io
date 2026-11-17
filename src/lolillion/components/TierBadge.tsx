import type { TierName } from '../engine/tiers';

/** Original CSS gem in the tier's colour; `null` is a miss. */
export default function TierBadge({ tier, size = 92 }: { tier: TierName | null; size?: number }) {
  return (
    <span
      className="lol-badge lol-pop inline-grid"
      style={{
        width: size,
        height: size,
        ['--c' as string]: tier ? `var(--tier-${tier.toLowerCase()})` : 'var(--line)',
      }}
      aria-hidden="true"
    />
  );
}
