import type { CSSProperties } from 'react';
import type { TierName } from '../engine/tiers';

// Higher tiers get a bigger celebration; Silver and Gold stay quiet.
const PARTICLES: Partial<Record<TierName, number>> = { Diamond: 12, Master: 18, Challenger: 32 };

interface Props {
  tier: TierName | null;
  size?: number;
  /** Rays, ring and particles: used once per reveal, not in lists. */
  celebrate?: boolean;
}

/** Original CSS gem in the tier's colour; `null` is a miss. */
export default function TierBadge({ tier, size = 92, celebrate = false }: Props) {
  const colour = tier ? `var(--tier-${tier.toLowerCase()})` : 'var(--muted)';
  const particles = celebrate && tier ? (PARTICLES[tier] ?? 0) : 0;
  return (
    <span
      className={`lol-badge ${celebrate ? 'lol-pop' : ''} ${tier === 'Challenger' && celebrate ? 'lol-challenger' : ''}`}
      style={{ width: size, height: size, ['--c' as string]: colour } as CSSProperties}
      aria-hidden="true"
    >
      {celebrate && tier && (
        <>
          <span className="lol-rays" />
          <span className="lol-ring" />
          {Array.from({ length: particles }, (_, i) => (
            <span
              key={i}
              className="lol-particle"
              style={
                {
                  // Evenly spread angles with a little jitter, so bursts look scattered but never clump.
                  '--a': `${(360 / particles) * i + ((i * 37) % 17)}deg`,
                  '--d': `${70 + ((i * 53) % 60)}px`,
                  '--delay': `${(i % 5) * 40}ms`,
                } as CSSProperties
              }
            />
          ))}
        </>
      )}
    </span>
  );
}
