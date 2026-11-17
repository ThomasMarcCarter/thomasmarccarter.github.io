import { useEffect, useRef, useState, type RefObject } from 'react';
import { CENTRE, CLIMB_MAX_LP, SUMMIT_ALT, VIEW_W, halfWidth, trailPoint } from '../engine/climb';
import { finalRank, ranks } from '../engine/ranks';

// Original pixel art: a spear-carrying warrior climbing a sandstone peak under the stars, drawn into a small buffer
// each frame and scaled up by a whole number without smoothing. The scene fills the window behind the game; the
// warrior walks the switchback trail as LP comes in, each rank has a flag at its corner, a pennant marks the best
// day so far, and starlight pours down on the summit.

interface Props {
  /** Today's LP so far; a change walks the climber to the new spot. */
  lp: number;
  /** Best day's LP, marked on the trail with a pennant; 0 hides it. */
  best: number;
  /** The open area above the game panel: the camera keeps the climber inside it. */
  focus: RefObject<HTMLElement | null>;
}

interface View {
  w: number;
  h: number;
  scale: number;
}

/** Chunky pixels on every screen, but never so big that the trail runs off a phone. */
function fitView(): View {
  const scale = Math.min(10, Math.max(3, Math.round(Math.min(innerWidth / 150, innerHeight / 100))));
  return { w: Math.ceil(innerWidth / scale), h: Math.ceil(innerHeight / scale), scale };
}

/** #rrggbb to a little-endian RGBA word for a Uint32Array view of ImageData. */
const px = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return ((255 << 24) | ((n & 255) << 16) | (((n >> 8) & 255) << 8) | (n >> 16)) >>> 0;
};

const C = {
  soil: px('#5e4630'),
  soilDark: px('#4a3624'),
  sand: px('#b08d5a'),
  sandDark: px('#8a6c44'),
  ridgeFar: px('#2b2a5e'),
  ridgeNear: px('#1e1f47'),
  cloud: px('#4d4788'),
  cloudTop: px('#6c65a8'),
  rockLight: px('#b07a52'),
  rock: px('#8a5a3c'),
  rockDark: px('#5e3b2a'),
  rockEdge: px('#2e1a14'),
  snow: px('#eef1ff'),
  snowShade: px('#aab3df'),
  trail: px('#d2b98f'),
  trailWalked: px('#f0d58a'),
  trailShadow: px('#3a2f4a'),
  star: px('#fff6dc'),
  starDim: px('#8f87c9'),
  pole: px('#d9d2c0'),
  flagOff: px('#4a4560'),
  beam: px('#5d6fc4'),
  beamBright: px('#a9b8ff'),
  best: px('#fff6dc'),
  bestBeaten: px('#f0d58a'),
};

/** Rank flag colours, read once from the --rank-* variables in global.css so the two can't drift apart. */
function rankColours(): Record<string, number> {
  const css = getComputedStyle(document.documentElement);
  return Object.fromEntries(
    ranks.map((r) => {
      const value = css.getPropertyValue(`--rank-${r.name.toLowerCase()}`).trim();
      return [r.name, /^#[0-9a-f]{6}$/i.test(value) ? px(value) : C.pole];
    }),
  );
}
const SKY = ['#3b4a85', '#34306e', '#221d4d', '#140f33', '#09071d'].map(px);
const SKY_STEP = 95;
const SNOW_LINE = 228;
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];

/** Stable pseudo-random value in [0, 1) for a pair of integers. */
const hash = (a: number, b: number) => {
  let h = (Math.imul(a, 374761393) + Math.imul(b, 668265263)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};

const ridgeFar = (x: number) => 26 + 8 * Math.sin(x * 0.06 + 1.3) + 4 * Math.sin(x * 0.17 + 0.4);
const ridgeNear = (x: number) => 12 + 6 * Math.sin(x * 0.09 + 2.1) + 3 * Math.sin(x * 0.23);
const CLOUDS = [
  { alt: 120, x: 20, w: 14, speed: 1.6 },
  { alt: 205, x: 110, w: 18, speed: 1.1 },
  { alt: 300, x: 60, w: 12, speed: 2 },
];

// The trail as pixels, each tagged with the LP it's reached at, so the walked part can be lit.
const TRAIL: { x: number; alt: number; lp: number }[] = [];
{
  const seen = new Set<string>();
  for (let lp = 0; lp <= CLIMB_MAX_LP; lp += 0.25) {
    const p = trailPoint(lp);
    const x = Math.round(p.x);
    const alt = Math.round(p.alt);
    const key = `${x},${alt}`;
    if (!seen.has(key)) {
      seen.add(key);
      TRAIL.push({ x, alt, lp });
    }
  }
}

type Sprite = { rows: string[]; colours: Record<string, number> };

// The warrior, facing right: plumed silver helm, teal tunic, spear behind, round shield in front.
const warrior = (legs: [string, string]): Sprite => ({
  rows: [
    '..t.........',
    '.ttt.rrrr...',
    '..p.rrRRrr..',
    '..p..oggggo.',
    '..p.ogggggGo',
    '..p.oggvvvGo',
    '..p.oggvgggo',
    '..p..oaaaoh.',
    '..psoaaaAhhh',
    '..p.oaaaAhHh',
    '..p.okkkAhHh',
    '..p.okkkkhh.',
    ...legs,
  ],
  colours: {
    o: px('#140c1c'),
    t: px('#e6ecf5'),
    p: px('#8a6a4a'),
    r: px('#4fb3e8'),
    R: px('#2a6f9e'),
    g: px('#c9d1dc'),
    G: px('#77818f'),
    v: px('#140c1c'),
    s: px('#c98b62'),
    a: px('#2f8f83'),
    A: px('#1d5c55'),
    k: px('#3d4a6b'),
    h: px('#d9a441'),
    H: px('#8e6a22'),
    l: px('#6b4a33'),
  },
});
const STAND = warrior(['..p..ol.lo..', '..p..oo.oo..']);
const STRIDE = warrior(['..p.ol...lo.', '..p.oo...oo.']);
const PASS = warrior(['..p...olo...', '..p...ooo...']);
const SPRITE_HALF = 6;

const SHRUB: Sprite = {
  rows: ['..g..', '.ggg.', '..g..', '.ggg.', 'ggggg', '..t..'],
  colours: { g: px('#4f5a2e'), t: px('#4a3324') },
};
const TENT: Sprite = {
  rows: ['...o...', '..oro..', '.orrro.', 'orrdrro', 'orrdrro'],
  colours: { o: px('#3a1a1a'), r: px('#b8473a'), d: px('#140c1c') },
};
/** Shrub positions in world pixels; the ones past either edge fill wide screens. */
const SHRUBS = [-30, -14, 4, 146, 155, 172, 190];
/** Swallowtail pennant for the best day, pointing right; flipped to trail behind the climber. */
const PENNANT = ['wwwww', 'www..', 'wwwww'];

export default function Climb({ lp, best, focus }: Props) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [view, setView] = useState<View | null>(null);
  // Animation state lives in a ref: it changes every frame and React never needs to see it.
  const anim = useRef({ shown: 0, from: 0, to: 0, start: 0, cam: Number.NaN, best: 0, dirty: true });

  useEffect(() => {
    anim.current.best = Math.min(Math.max(best, 0), CLIMB_MAX_LP);
    anim.current.dirty = true;
  }, [best]);

  useEffect(() => {
    const fit = () =>
      setView((v) => {
        const next = fitView();
        return v && v.w === next.w && v.h === next.h && v.scale === next.scale ? v : next;
      });
    fit();
    addEventListener('resize', fit);
    return () => removeEventListener('resize', fit);
  }, []);

  useEffect(() => {
    const a = anim.current;
    a.from = a.shown;
    a.to = Math.min(Math.max(lp, 0), CLIMB_MAX_LP);
    a.start = performance.now();
    a.dirty = true;
  }, [lp]);

  useEffect(() => {
    const ctx = canvas.current?.getContext('2d');
    if (!ctx || !view) return;
    const { w: W, h: H, scale } = view;
    const image = ctx.createImageData(W, H);
    const buf = new Uint32Array(image.data.buffer);
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const a = anim.current;
    a.dirty = true;
    const flagColours = rankColours();
    // The mountain lives in a fixed 160-pixel-wide world, centred on whatever width the window gives.
    const offX = Math.floor((W - VIEW_W) / 2);
    const farRidge = Array.from({ length: W }, (_, x) => ridgeFar(x - offX));
    const nearRidge = Array.from({ length: W }, (_, x) => ridgeNear(x - offX));

    const set = (x: number, row: number, colour: number) => {
      if (x >= 0 && x < W && row >= 0 && row < H) buf[row * W + x] = colour;
    };
    const blit = (s: Sprite, left: number, bottomRow: number, flip = false) => {
      const w = s.rows[0].length;
      s.rows.forEach((line, r) => {
        for (let i = 0; i < w; i++) {
          const colour = s.colours[line[flip ? w - 1 - i : i]];
          if (colour !== undefined) set(left + i, bottomRow - (s.rows.length - 1 - r), colour);
        }
      });
    };

    /** The row the climber's feet should sit on: inside the open sky above the panel. */
    const anchorRow = () => {
      const r = focus.current?.getBoundingClientRect();
      if (!r) return H * 0.35;
      const y = r.height > 64 ? r.top + r.height * 0.62 : Math.max(r.top, 56);
      return Math.round(y / scale);
    };

    const draw = (now: number) => {
      const t = reduced ? 0 : now / 1000;
      const span = Math.abs(a.to - a.from);
      const duration = Math.min(2600, Math.max(450, span * 12));
      const p = reduced ? 1 : Math.min(1, (now - a.start) / duration);
      a.shown = a.from + (a.to - a.from) * (0.5 - Math.cos(Math.PI * p) / 2);
      const moving = p < 1 && span > 0;

      const me = trailPoint(a.shown);
      const summitLit = a.shown >= CLIMB_MAX_LP;
      const camTarget = me.alt - (H - 1 - anchorRow());
      a.cam = Number.isNaN(a.cam) || reduced ? camTarget : a.cam + (camTarget - a.cam) * 0.12;
      const cam = Math.round(a.cam);
      const rowOf = (alt: number) => H - 1 - (Math.round(alt) - cam);

      // Sky, distant ridges, clouds, the mountain and the ground, one pixel at a time.
      for (let row = 0; row < H; row++) {
        const fromBottom = H - 1 - row;
        const alt = cam + fromBottom;
        const w = alt >= 0 && alt <= SUMMIT_ALT ? halfWidth(alt) + (hash(alt >> 1, 7) < 0.5 ? 0 : 1) : -1;
        for (let x = 0; x < W; x++) {
          const i = row * W + x;
          const wx = x - offX;
          if (alt < 0) {
            buf[i] = alt === -1 ? C.sand : alt >= -3 ? C.sandDark : hash(wx, alt) < 0.12 ? C.soilDark : C.soil;
            continue;
          }
          const rel = (wx + 0.5 - CENTRE) / w;
          if (w > 0 && Math.abs(rel) <= 1) {
            const snowy = alt > SNOW_LINE + 7 * Math.sin(wx * 0.45) + hash(wx, 3) * 5;
            if (Math.abs(rel) > 0.93) buf[i] = C.rockEdge;
            else if (snowy) buf[i] = rel < 0.25 ? C.snow : C.snowShade;
            else if (hash(wx, alt) < 0.07) buf[i] = C.rockDark;
            else buf[i] = rel < -0.35 ? C.rockLight : rel < 0.35 ? C.rock : C.rockDark;
            continue;
          }
          if (cam * 0.6 + fromBottom < nearRidge[x]) {
            buf[i] = C.ridgeNear;
            continue;
          }
          if (cam * 0.35 + fromBottom < farRidge[x]) {
            buf[i] = C.ridgeFar;
            continue;
          }
          const cloud = CLOUDS.find((c) => {
            const cx = ((((c.x + offX + t * c.speed) % (W + 40)) + W + 40) % (W + 40)) - 20;
            return ((x - cx) / c.w) ** 2 + ((alt - c.alt) / 3) ** 2 < 1;
          });
          if (cloud) {
            buf[i] = alt > cloud.alt + 1 ? C.cloudTop : C.cloud;
            continue;
          }
          // Starlight pours down onto the peak; it burns brighter once the warrior stands on the summit.
          if (alt > SUMMIT_ALT - 4) {
            const off = Math.abs(wx + 0.5 - CENTRE);
            const width = 2.5 + Math.min(6, (alt - SUMMIT_ALT) * 0.06);
            if (off < width && BAYER[(x & 3) + ((alt & 3) << 2)] < (summitLit ? 14 : 8) - off * 2) {
              buf[i] = off < 1.2 && summitLit ? C.beamBright : C.beam;
              continue;
            }
          }
          const density = 0.006 + Math.min(1, Math.max(0, (alt - 30) / 240)) * 0.03;
          if (hash(wx, alt) < density) {
            const twinkle = !reduced && hash(wx * 3 + Math.floor(t * 2.5), alt) < 0.18;
            buf[i] = twinkle ? C.starDim : C.star;
            continue;
          }
          // Ordered dithering between sky bands keyed to world height, so it scrolls with the scene.
          const band = alt / SKY_STEP;
          const low = Math.min(SKY.length - 1, Math.floor(band));
          const high = Math.min(SKY.length - 1, low + 1);
          buf[i] = (band - low) * 16 > BAYER[(x & 3) + ((alt & 3) << 2)] ? SKY[high] : SKY[low];
        }
      }

      SHRUBS.forEach((x, k) => blit(SHRUB, offX + x - 2, rowOf(0) - 1 + (k % 2)));
      blit(TENT, offX + 12, rowOf(0) - 1);

      // Shadows first, so where legs meet at a corner the trail itself stays on top.
      for (const step of TRAIL) set(offX + step.x, rowOf(step.alt) + 1, C.trailShadow);
      for (const step of TRAIL) set(offX + step.x, rowOf(step.alt), step.lp <= a.shown ? C.trailWalked : C.trail);

      // A flag at every rank corner: grey until reached, then in the rank's colour.
      ranks.forEach((rank, k) => {
        const spot = trailPoint(rank.min);
        const x = offX + Math.round(spot.x) + (k === 0 ? -3 : k % 2 === 1 ? 2 : -2);
        const base = rowOf(spot.alt);
        const reached = a.shown >= rank.min;
        const colour = reached ? flagColours[rank.name] : C.flagOff;
        const big = rank.min === CLIMB_MAX_LP;
        const tall = big ? 11 : 8;
        for (let h = 1; h <= tall; h++) set(x, base - h, C.pole);
        const wave = reduced || !reached ? 0 : Math.floor(t * 4 + k) % 2;
        const flagW = big ? 6 : 4;
        for (let r = 0; r < (big ? 4 : 3); r++) {
          for (let c = 0; c < flagW; c++) set(x + 1 + c, base - tall + r + (c >= flagW / 2 ? wave : 0), colour);
        }
      });

      // The best day so far: a cream pennant with a sparkle above it, gold once today's climb has passed it.
      if (a.best > 0) {
        const spot = trailPoint(a.best);
        // On a rank corner, step inward so it doesn't sit on the rank flag.
        const nudge = a.best % 100 === 0 ? (spot.x < CENTRE ? 4 : -4) : 0;
        const x = offX + Math.round(spot.x) + nudge;
        const base = rowOf(spot.alt);
        const beaten = a.shown > a.best;
        const tall = 7;
        for (let h = 1; h <= tall; h++) set(x, base - h, C.pole);
        PENNANT.forEach((line, r) => {
          [...line].forEach((ch, c) => {
            if (ch === 'w') set(x + (spot.dir === 1 ? -1 - c : 1 + c), base - tall + r, beaten ? C.bestBeaten : C.best);
          });
        });
        if (!beaten && (reduced || Math.floor(t * 3) % 2 === 0)) {
          for (const [dx, dy] of [[0, 0], [-1, 0], [1, 0], [0, -1], [0, 1]]) set(x + dx, base - tall - 3 + dy, C.star);
        }
      }

      // The climber: strides while walking, faces the way the trail runs, cheers at the summit.
      const summit = !moving && summitLit;
      const stepFrame = Math.floor(now / 110) % 2;
      const sprite = moving ? (stepFrame ? STRIDE : PASS) : STAND;
      const hop = moving ? stepFrame : summit && !reduced && Math.floor(now / 280) % 2 ? 2 : 0;
      blit(sprite, offX + Math.round(me.x) - SPRITE_HALF, rowOf(me.alt) - 1 - hop, me.dir === -1);

      ctx.putImageData(image, 0, 0);
      a.dirty = moving || Math.abs(camTarget - a.cam) > 0.5;
    };

    let frame = 0;
    let last = 0;
    let lastAnchor = Number.NaN;
    const loop = (now: number) => {
      frame = requestAnimationFrame(loop);
      // 30 fps while walking or panning; 8 fps is enough for twinkling stars and waving flags when idle.
      // Reduced motion only redraws when something changed.
      if (now - last < (a.dirty ? 33 : 125)) return;
      if (reduced) {
        const anchor = anchorRow();
        if (!a.dirty && anchor === lastAnchor) return;
        lastAnchor = anchor;
      }
      last = now;
      draw(now);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [view, focus]);

  const rank = finalRank(lp);
  return (
    <div
      className="lol-climb"
      role="img"
      aria-label={`Your climb: ${rank.name}, ${lp} of ${CLIMB_MAX_LP} LP${best > 0 ? `. Best day: ${best} LP` : ''}`}
    >
      {view && (
        <canvas
          ref={canvas}
          width={view.w}
          height={view.h}
          style={{ width: view.w * view.scale, height: view.h * view.scale }}
        />
      )}
    </div>
  );
}

/** Rank, LP and best for the top bar. Hidden from screen readers: the scene's label already says it. */
export function ClimbHud({ lp, best }: { lp: number; best: number }) {
  const rank = finalRank(lp);
  return (
    <div className="lol-hud" aria-hidden="true">
      <span style={{ color: `var(--rank-${rank.name.toLowerCase()})` }}>{rank.name}</span>
      <span>{lp} LP</span>
      {best > 0 && <span className="lol-hud-best">Best {best}</span>}
    </div>
  );
}
