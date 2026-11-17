import { describe, expect, it } from 'vitest';
import { CENTRE, CLIMB_MAX_LP, halfWidth, trailPoint } from './climb';

describe('trailPoint', () => {
  it('starts at the foot and ends just under the summit', () => {
    expect(trailPoint(0).alt).toBe(0);
    expect(trailPoint(CLIMB_MAX_LP).alt).toBeGreaterThan(trailPoint(600).alt);
  });

  it('clamps LP outside the climb', () => {
    expect(trailPoint(-50)).toEqual(trailPoint(0));
    expect(trailPoint(900)).toEqual(trailPoint(CLIMB_MAX_LP));
  });

  it('zigzags: each rank leg turns back at a corner without a jump', () => {
    for (let lp = 100; lp < CLIMB_MAX_LP; lp += 100) {
      const before = trailPoint(lp - 0.001);
      const after = trailPoint(lp);
      expect(Math.abs(after.x - before.x)).toBeLessThan(0.1);
      expect(after.dir).toBe(-before.dir);
    }
  });

  it('stays on the mountain face', () => {
    for (let lp = 0; lp <= CLIMB_MAX_LP; lp += 7) {
      const p = trailPoint(lp);
      expect(Math.abs(p.x - CENTRE)).toBeLessThan(halfWidth(p.alt));
    }
  });
});
