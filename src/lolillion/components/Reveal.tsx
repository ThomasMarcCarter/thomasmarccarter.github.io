import type { Question } from '../data/questions';
import type { Entry } from '../data/types';
import { rarityPercent, scoreAnswer } from '../engine/score';
import { Progress } from './QuestionCard';
import TierBadge from './TierBadge';
import { iconUrl } from './icons';

interface Props {
  question: Question;
  /** null when the time ran out. */
  entry: Entry | null;
  index: number;
  total: number;
  onNext: () => void;
}

const rarityLine = (percent: number) =>
  percent === 0 ? 'The most common right answer' : `Rarer than ${percent}% of right answers`;

export default function Reveal({ question, entry, index, total, onNext }: Props) {
  const { tier, points } = scoreAnswer(question, entry?.id ?? null);
  const colour = tier ? `var(--tier-${tier.name.toLowerCase()})` : 'var(--muted)';
  const heading = tier ? tier.name : entry ? 'Not a right answer' : 'No answer';
  return (
    <div className="text-center">
      <Progress done={index + 1} total={total} />
      <p className="mt-5 text-xs tracking-[0.14em] text-accent uppercase">{question.prompt}</p>
      <p className="mt-4 flex items-center justify-center gap-3 text-lg font-bold">
        {entry && <img src={iconUrl(question.pool, entry.icon)} alt="" width={40} height={40} />}
        {entry ? entry.name : "Time's up"}
      </p>
      <div className="mt-4">
        <TierBadge tier={tier?.name ?? null} />
      </div>
      <h1 className="lol-display mt-2 text-2xl font-bold" style={{ color: colour }}>
        {heading}
      </h1>
      <p className="lol-display my-1 text-4xl font-bold">+{points} LP</p>
      {tier && entry && <p className="text-muted">{rarityLine(rarityPercent(question, entry.id))}</p>}
      <button type="button" className="lol-button mt-8" onClick={onNext} autoFocus>
        {index + 1 === total ? 'See results' : 'Next prompt'}
      </button>
    </div>
  );
}
