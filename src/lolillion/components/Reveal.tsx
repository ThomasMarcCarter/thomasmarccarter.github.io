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
      <p className="lol-display mt-[clamp(0.75rem,2.5dvh,1.5rem)] text-sm text-accent">{question.prompt}</p>
      <p id="reveal-answer" className="mt-[clamp(0.5rem,1.5dvh,1rem)] flex items-center justify-center gap-3 text-lg font-bold">
        {entry && <img src={iconUrl(question.pool, entry.icon)} alt="" width={40} height={40} className="lol-icon" />}
        {entry ? entry.name : 'Time ran out'}
      </p>
      <div className="mt-[clamp(0.5rem,2.5dvh,1.5rem)] grid place-items-center">
        <TierBadge tier={tier?.name ?? null} size="clamp(56px, 12dvh, 104px)" celebrate />
      </div>
      <h1 id="reveal-tier" className="lol-display mt-[clamp(0.25rem,1.5dvh,1rem)] text-[clamp(1.5rem,4.5dvh,1.875rem)] font-bold" style={{ color: colour }}>
        {tier ? tier.name : 'No LP this time'}
      </h1>
      <p id="reveal-lp" className="lol-display lol-lp my-1 text-[clamp(2rem,7dvh,3rem)] font-bold" aria-label={`+${points} LP`}>
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
        className="lol-button mt-[clamp(0.75rem,3dvh,2rem)]"
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
