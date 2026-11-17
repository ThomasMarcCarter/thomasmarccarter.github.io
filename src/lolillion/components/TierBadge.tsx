import type { CSSProperties } from 'react';
import type { TierName } from '../engine/tiers';

// Higher tiers get a bigger celebration; Silver and Gold stay quiet.
const PARTICLES: Partial<Record<TierName, number>> = { Diamond: 12, Master: 18, Challenger: 32 };

// Original pixel gem: o outline, h highlight, m body, d shade.
const GEM = ['...ooo...', '..ohhmo..', '.ohhmmmo.', 'ohmmmmmdo', 'ommmmmmdo', '.ommmmdo.', '..ommdo..', '...odo...', '....o....'];
const FILL: Record<string, string> = {
  o: '#140c1c',
  h: 'color-mix(in srgb, var(--c) 45%, white)',
  m: 'var(--c)',
  d: 'color-mix(in srgb, var(--c) 60%, black)',
};

interface Props {
  tier: TierName | null;
  /** Pixels, or any CSS length such as a clamp() that shrinks on short screens. */
  size?: number | string;
  /** Rays, ring and particles: used once per reveal, not in lists. */
  celebrate?: boolean;
  /** Overrides the tier colour, e.g. for the day's final rank. */
  colour?: string;
}

/** Pixel gem in the tier's colour; `null` with no colour is a miss. */
export default function TierBadge({ tier, size = 92, celebrate = false, colour }: Props) {
  const c = colour ?? (tier ? `var(--tier-${tier.toLowerCase()})` : 'var(--muted)');
  const lit = tier !== null || colour !== undefined;
  const particles = celebrate && tier ? (PARTICLES[tier] ?? 0) : 0;
  return (
    <span
      className={`lol-badge ${celebrate ? 'lol-pop' : ''} ${tier === 'Challenger' && celebrate ? 'lol-challenger' : ''}`}
      style={{ width: size, height: size, ['--c' as string]: c } as CSSProperties}
      aria-hidden="true"
    >
      {celebrate && lit && (
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
      <svg viewBox="0 0 9 9" shapeRendering="crispEdges">
        {GEM.flatMap((row, y) =>
          [...row].map((ch, x) =>
            ch === '.' ? null : <rect key={`${x},${y}`} x={x} y={y} width={1.02} height={1.02} style={{ fill: FILL[ch] }} />,
          ),
        )}
      </svg>
    </span>
  );
}
