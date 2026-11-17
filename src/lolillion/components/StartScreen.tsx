import { play } from '../sound';
import HowToPlay from './HowToPlay';

interface Props {
  number: number;
  streak: number;
  played: number;
  best: number;
  resuming: boolean;
  onPlay: () => void;
}

export default function StartScreen({ number, streak, played, best, resuming, onPlay }: Props) {
  const stats: [string, number][] = [
    ['Day streak', streak],
    ['Played', played],
    ['Best LP', best],
  ];
  return (
    <div className="text-center">
      <h1 className="lol-display lol-title text-[clamp(3rem,13vw,4.75rem)] leading-none font-bold">Lolillion</h1>
      <p className="mx-auto mt-4 max-w-[34ch] text-lg text-ink/85">
        Seven prompts a day. Any right answer climbs, but the rarer it is, the more LP you gain.
      </p>
      <button
        type="button"
        className="lol-button mt-8"
        onClick={() => {
          play('click');
          onPlay();
        }}
      >
        {resuming ? `Continue puzzle #${number}` : `Play puzzle #${number}`}
      </button>
      <div className="mt-3">
        <HowToPlay />
      </div>
      <dl className="lol-stats mt-8 grid grid-cols-3">
        {stats.map(([label, value]) => (
          <div key={label} className="flex flex-col-reverse py-3">
            <dt className="text-sm text-muted">{label}</dt>
            <dd className="lol-display text-3xl font-bold text-ink">{value}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-6 text-sm text-muted">4 champion prompts and 3 item prompts, 25 seconds each</p>
    </div>
  );
}
