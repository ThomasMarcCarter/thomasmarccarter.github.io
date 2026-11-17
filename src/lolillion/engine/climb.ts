// Geometry of the pixel-art climb: LP becomes a point on a switchback trail up a mountain.
// One leg of the trail per 100 LP (one rank), so each rank flag sits at a corner.

export const CLIMB_MAX_LP = 700;
/** Scene width in art pixels; the canvas is scaled up without smoothing. */
export const VIEW_W = 160;
export const CENTRE = VIEW_W / 2;
/** World pixels of height gained per LP. */
export const ALT_PER_LP = 0.5;
export const SUMMIT_ALT = 362;
const BASE_HALF_WIDTH = 74;
const LP_PER_LEG = 100;
/** How far across the mountain face each leg runs, as a share of its half-width. */
const TRAIL_SPREAD = 0.72;

/** Half the mountain's width at a given altitude: wide at the foot, a point at the summit. */
export function halfWidth(alt: number): number {
  return Math.max(2, BASE_HALF_WIDTH * (1 - alt / (SUMMIT_ALT + 18)));
}

export interface TrailPoint {
  x: number;
  alt: number;
  /** 1 walking right, -1 walking left. */
  dir: 1 | -1;
}

/** Where a player with `lp` stands. Legs alternate direction, so the trail zigzags up the face. */
export function trailPoint(lp: number): TrailPoint {
  const clamped = Math.min(CLIMB_MAX_LP, Math.max(0, lp));
  const leg = Math.min(CLIMB_MAX_LP / LP_PER_LEG - 1, Math.floor(clamped / LP_PER_LEG));
  const f = (clamped - leg * LP_PER_LEG) / LP_PER_LEG;
  const dir = leg % 2 === 0 ? 1 : -1;
  const alt = clamped * ALT_PER_LP;
  return { x: CENTRE + dir * (2 * f - 1) * TRAIL_SPREAD * halfWidth(alt), alt, dir };
}
