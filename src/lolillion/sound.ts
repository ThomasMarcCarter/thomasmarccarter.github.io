// Interface sounds by Kenney (kenney.nl), CC0. Files live in public/lolillion/sounds/.
import { readJson, writeJson } from './engine/storage';

export type Sound =
  | 'click'
  | 'select'
  | 'wrong'
  | 'timeout'
  | 'tick'
  | 'open'
  | 'copy'
  | 'silver'
  | 'gold'
  | 'platinum'
  | 'diamond'
  | 'master'
  | 'challenger';

const VOLUME = 0.5;
const cache = new Map<Sound, HTMLAudioElement>();
let muted = readJson('muted', false);

const base = `${import.meta.env.BASE_URL.replace(/\/$/, '')}/lolillion/sounds`;

export const isMuted = () => muted;

export function setMuted(value: boolean) {
  muted = value;
  writeJson('muted', value);
}

export function play(name: Sound) {
  if (muted || typeof Audio === 'undefined') return;
  let audio = cache.get(name);
  if (!audio) {
    audio = new Audio(`${base}/${name}.mp3`);
    audio.volume = VOLUME;
    cache.set(name, audio);
  }
  audio.currentTime = 0;
  // Browsers refuse playback before the first user gesture; a missed sound isn't worth an error.
  audio.play().catch(() => {});
}
