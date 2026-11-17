import { useEffect } from 'react';
import type { Question } from '../data/questions';
import type { Entry } from '../data/types';
import { rarityPercent, scoreAnswer } from '../engine/score';
import { useCountUp } from '../hooks/useCountUp';
import { play, type Sound } from '../sound';
import { Progress } from './QuestionCard';
import TierBadge from './TierBadge';
import { iconUrl } from './icons';

interface Props {
  question: Question;
  /** null when the time ran out; otherwise always a right answer. */
  entry: Entry | null;
  index: number;
  total: number;
  onNext: () => void;
}

const rarityLine = (percent: number) =>
  percent === 0 ? 'The most common right answer' : `Rarer than ${percent}% of right answers`;

export default function Reveal({ question, entry, index, total, onNext }: Props) {
  const { tier, points } = scoreAnswer(question, entry?.id ?? null);
  const shown = useCountUp(points);
  const colour = tier ? `var(--tier-${tier.name.toLowerCase()})` : 'var(--muted)';

  useEffect(() => play(tier ? (tier.name.toLowerCase() as Sound) : 'timeout'), [tier]);

  return (
    <div className="text-center" style={{ ['--c' as string]: colour }}>
      <Progress done={index + 1} total={total} />
      <p className="lol-display mt-6 text-sm text-accent">{question.prompt}</p>
      <p id="reveal-answer" className="mt-4 flex items-center justify-center gap-3 text-lg font-bold">
        {entry && <img src={iconUrl(question.pool, entry.icon)} alt="" width={40} height={40} className="lol-icon" />}
        {entry ? entry.name : 'Time ran out'}
      </p>
      <div className="mt-6 grid place-items-center">
        <TierBadge tier={tier?.name ?? null} size={112} celebrate />
      </div>
      <h1 id="reveal-tier" className="lol-display mt-4 text-3xl font-bold" style={{ color: colour }}>
        {tier ? tier.name : 'No LP this time'}
      </h1>
      <p id="reveal-lp" className="lol-display lol-lp my-1 text-5xl font-bold" aria-label={`+${points} LP`}>
        +{shown} LP
      </p>
      {tier && entry && (
        <p id="reveal-rarity" className="text-muted">
          {rarityLine(rarityPercent(question, entry.id))}
        </p>
      )}
      {/* Focus lands on the button, so it carries the outcome for screen readers. */}
      <button
        type="button"
        className="lol-button mt-8"
        onClick={() => {
          play('click');
          onNext();
        }}
        autoFocus
        aria-describedby={`reveal-answer reveal-tier reveal-lp${tier && entry ? ' reveal-rarity' : ''}`}
      >
        {index + 1 === total ? 'See results' : 'Next prompt'}
      </button>
    </div>
  );
}
