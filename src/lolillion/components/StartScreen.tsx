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
    ['day streak', streak],
    ['played', played],
    ['best LP', best],
  ];
  return (
    <div>
      <div className="lol-frame p-6">
        <h1 className="lol-display text-[clamp(2.5rem,10vw,3.5rem)] leading-none font-bold text-accent">Lolillion</h1>
        <p className="mt-3 text-muted">
          Seven prompts. Any right answer climbs. The rarer your answer, the more LP you gain.
        </p>
        <button type="button" className="lol-button mt-6" onClick={onPlay}>
          {resuming ? `Continue #${number}` : `Play #${number}`}
        </button>
        <div className="mt-3">
          <HowToPlay />
        </div>
      </div>
      <dl className="mt-8 grid grid-cols-3 text-center text-sm text-muted">
        {stats.map(([label, value]) => (
          <div key={label} className="flex flex-col-reverse">
            <dt>{label}</dt>
            <dd className="lol-display text-2xl font-bold text-ink">{value}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-8 text-center text-sm text-muted">4 champion prompts · 3 item prompts · 25 seconds each</p>
    </div>
  );
}
