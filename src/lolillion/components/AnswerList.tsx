import type { Question } from '../data/questions';
import { answersByTier } from '../engine/score';
import TierBadge from './TierBadge';
import { iconUrl } from './icons';

interface Props {
  id: string;
  question: Question;
  /** The player's answer, highlighted in the list; null after a timeout. */
  chosenId: string | null;
}

/** Every right answer to a prompt, grouped by the tier and LP it scores, rarest first. */
export default function AnswerList({ id, question, chosenId }: Props) {
  const groups = answersByTier(question);
  const count = groups.reduce((n, g) => n + g.entries.length, 0);
  return (
    <div id={id} className="lol-answers mb-3 p-4">
      <p className="text-sm text-muted">{count} right answers</p>
      {groups.map(({ tier, entries }) => {
        const colour = `var(--tier-${tier.name.toLowerCase()})`;
        return (
          <section key={tier.name} className="mt-4" aria-label={`${tier.name}, ${tier.points} LP`}>
            <h3 className="flex items-center gap-2 text-sm font-bold" style={{ color: colour }}>
              <TierBadge tier={tier.name} size={16} />
              <span className="lol-display">{tier.name}</span>
              <span className="tabular-nums">+{tier.points} LP</span>
            </h3>
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {entries.map((e) => (
                <li
                  key={e.id}
                  className={`lol-chip flex items-center gap-1.5 py-0.5 pr-2 pl-0.5 text-sm ${e.id === chosenId ? 'is-chosen' : ''}`}
                  style={{ ['--c' as string]: colour }}
                >
                  <img src={iconUrl(question.pool, e.icon)} alt="" width={22} height={22} loading="lazy" />
                  {e.name}
                  {e.id === chosenId && <span className="sr-only">(your answer)</span>}
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
