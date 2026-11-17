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
      <h1 className="lol-display lol-title text-[clamp(2.25rem,min(12vw,8cqh),4rem)] leading-none font-bold">Lolillion</h1>
      <p className="mx-auto mt-[clamp(0.5rem,2cqh,1rem)] max-w-[36ch] text-ink/85">
        Seven prompts a day. Every right answer climbs the mountain, and the rarer it is, the further you climb.
      </p>
      <button
        type="button"
        className="lol-button mt-[clamp(0.75rem,3cqh,2rem)]"
        onClick={() => {
          play('click');
          onPlay();
        }}
      >
        {resuming ? `Continue puzzle #${number}` : `Play puzzle #${number}`}
      </button>
      <div className="mt-2">
        <HowToPlay />
      </div>
      <dl className="lol-stats mt-[clamp(0.75rem,3cqh,2rem)] grid grid-cols-3">
        {stats.map(([label, value]) => (
          <div key={label} className="flex flex-col-reverse py-[clamp(0.25rem,1cqh,0.75rem)]">
            <dt className="text-sm text-muted">{label}</dt>
            <dd className="lol-display text-[clamp(1.25rem,4cqh,1.875rem)] font-bold text-ink">{value}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-[clamp(0.5rem,2cqh,1.5rem)] text-sm text-muted">4 champion prompts and 3 item prompts, 25 seconds each</p>
    </div>
  );
}
