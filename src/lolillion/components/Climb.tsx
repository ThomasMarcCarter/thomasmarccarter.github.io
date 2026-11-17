import { useEffect, useRef, useState, type RefObject } from 'react';
import { CENTRE, CLIMB_MAX_LP, SUMMIT_ALT, VIEW_W, halfWidth, trailPoint } from '../engine/climb';
import { finalRank, ranks } from '../engine/ranks';

// Original pixel art, drawn into a small buffer each frame and scaled up by a whole number without smoothing.
// The scene fills the window behind the game; the climber walks the switchback trail as LP comes in,
// and each rank has a flag at its corner.

interface Props {
  /** Today's LP so far; a change walks the climber to the new spot. */
  lp: number;
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

// Mirrors the --rank-* colours in global.css; the canvas can't read CSS variables cheaply per pixel.
const RANK_COLOURS: Record<string, string> = {
  Iron: '#9a8f88',
  Bronze: '#c47d4f',
  Silver: '#b8c0cc',
  Gold: '#e3b341',
  Platinum: '#3fc1a5',
  Diamond: '#6f9bff',
  Master: '#c27ce8',
  Challenger: '#f2c94c',
};

/** #rrggbb to a little-endian RGBA word for a Uint32Array view of ImageData. */
const px = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return ((255 << 24) | ((n & 255) << 16) | (((n >> 8) & 255) << 8) | (n >> 16)) >>> 0;
};

const C = {
  ground: px('#2a4a2e'),
  groundDark: px('#22402a'),
  grass: px('#4f8a4a'),
  grassDark: px('#3c6e3d'),
  ridgeFar: px('#2b2a5e'),
  ridgeNear: px('#1e1f47'),
  cloud: px('#4d4788'),
  cloudTop: px('#6c65a8'),
  rockLight: px('#7a6a8c'),
  rock: px('#5f5174'),
  rockDark: px('#463b5a'),
  rockEdge: px('#2c2440'),
  snow: px('#eef1ff'),
  snowShade: px('#aab3df'),
  trail: px('#a2917c'),
  trailWalked: px('#f0d58a'),
  trailShadow: px('#3a2f4a'),
  star: px('#fff6dc'),
  starDim: px('#8f87c9'),
  pole: px('#d9d2c0'),
  flagOff: px('#4a4560'),
};
const FLAG_COLOURS = Object.fromEntries(Object.entries(RANK_COLOURS).map(([k, v]) => [k, px(v)]));
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

const climber = (legs: [string, string]): Sprite => ({
  rows: ['..oooo..', '.ohhhho.', 'ohhhhhho', 'ohhffefo', 'ohhffffo', '.occbbo.', 'occcbbbo', 'occcbbbo', '.oobboo.', ...legs],
  colours: {
    o: px('#140c1c'),
    h: px('#3f6fb5'),
    f: px('#f2c9a0'),
    e: px('#140c1c'),
    c: px('#e3b341'),
    b: px('#2d3f73'),
    l: px('#6b4a33'),
  },
});
const STAND = climber(['.ol..lo.', '.oo..oo.']);
const STRIDE = climber(['ol....lo', 'oo....oo']);
const PASS = climber(['..olo...', '..ooo...']);

const PINE: Sprite = {
  rows: ['..g..', '.ggg.', '..g..', '.ggg.', 'ggggg', '..t..'],
  colours: { g: px('#24553a'), t: px('#4a3324') },
};
const TENT: Sprite = {
  rows: ['...o...', '..oro..', '.orrro.', 'orrdrro', 'orrdrro'],
  colours: { o: px('#3a1a1a'), r: px('#b8473a'), d: px('#140c1c') },
};
/** Pine positions in world pixels; the ones past either edge fill wide screens. */
const PINES = [-30, -14, 4, 146, 155, 172, 190];

export default function Climb({ lp, focus }: Props) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [view, setView] = useState<View | null>(null);
  // Animation state lives in a ref: it changes every frame and React never needs to see it.
  const anim = useRef({ shown: 0, from: 0, to: 0, start: 0, cam: Number.NaN, dirty: true });

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
            buf[i] = alt === -1 ? C.grass : alt >= -3 ? C.grassDark : hash(wx, alt) < 0.12 ? C.groundDark : C.ground;
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
          const density = Math.min(1, Math.max(0, (alt - 70) / 260)) * 0.025;
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

      PINES.forEach((x, k) => blit(PINE, offX + x - 2, rowOf(0) - 1 + (k % 2)));
      blit(TENT, offX + 12, rowOf(0) - 1);

      // Shadows first, so where legs meet at a corner the trail itself stays on top.
      for (const step of TRAIL) set(offX + step.x, rowOf(step.alt) + 1, C.trailShadow);
      for (const step of TRAIL) set(offX + step.x, rowOf(step.alt), step.lp <= a.shown ? C.trailWalked : C.trail);

      // A flag at every rank corner: grey until reached, then in the rank's colour.
      ranks.forEach((rank, k) => {
        if (rank.min > CLIMB_MAX_LP) return;
        const spot = trailPoint(rank.min);
        const x = offX + Math.round(spot.x) + (k === 0 ? -3 : k % 2 === 1 ? 2 : -2);
        const base = rowOf(spot.alt);
        const reached = a.shown >= rank.min;
        const colour = reached ? FLAG_COLOURS[rank.name] : C.flagOff;
        const big = rank.min === CLIMB_MAX_LP;
        const tall = big ? 11 : 8;
        for (let h = 1; h <= tall; h++) set(x, base - h, C.pole);
        const wave = reduced || !reached ? 0 : Math.floor(t * 4 + k) % 2;
        const flagW = big ? 6 : 4;
        for (let r = 0; r < (big ? 4 : 3); r++) {
          for (let c = 0; c < flagW; c++) set(x + 1 + c, base - tall + r + (c >= flagW / 2 ? wave : 0), colour);
        }
      });

      // The climber: strides while walking, faces the way the trail runs, cheers at the summit.
      const summit = !moving && a.shown >= CLIMB_MAX_LP;
      const stepFrame = Math.floor(now / 110) % 2;
      const sprite = moving ? (stepFrame ? STRIDE : PASS) : STAND;
      const hop = moving ? stepFrame : summit && !reduced && Math.floor(now / 280) % 2 ? 2 : 0;
      blit(sprite, offX + Math.round(me.x) - 4, rowOf(me.alt) - 1 - hop, me.dir === -1);

      ctx.putImageData(image, 0, 0);
      a.dirty = moving || Math.abs(camTarget - a.cam) > 0.5;
    };

    let frame = 0;
    let last = 0;
    let lastAnchor = Number.NaN;
    const loop = (now: number) => {
      frame = requestAnimationFrame(loop);
      // 30 fps is plenty for pixel art; reduced motion only redraws when something changed.
      if (now - last < 33) return;
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
    <div className="lol-climb" role="img" aria-label={`Your climb: ${rank.name}, ${lp} of ${CLIMB_MAX_LP} LP`}>
      {view && (
        <canvas
          ref={canvas}
          width={view.w}
          height={view.h}
          style={{ width: view.w * view.scale, height: view.h * view.scale }}
        />
      )}
      <div className="lol-hud" aria-hidden="true">
        <span style={{ color: `var(--rank-${rank.name.toLowerCase()})` }}>{rank.name}</span>
        <span>{lp} LP</span>
      </div>
    </div>
  );
}
