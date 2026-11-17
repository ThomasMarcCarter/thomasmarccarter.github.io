import type { Question } from '../data/questions';
import type { Entry } from '../data/types';
import { PROMPT_MS } from '../engine/game';
import AnswerInput from './AnswerInput';

interface Props {
  question: Question;
  index: number;
  total: number;
  remaining: number;
  entries: readonly Entry[];
  onSubmit: (entry: Entry, input: string) => void;
}

export function Progress({ done, total }: { done: number; total: number }) {
  return (
    <div className="flex gap-1.5" aria-hidden="true">
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={`h-1 flex-1 ${i < done ? 'bg-accent' : 'bg-line'}`} />
      ))}
    </div>
  );
}

const LOW_TIME_S = 5;

export default function QuestionCard({ question, index, total, remaining, entries, onSubmit }: Props) {
  const seconds = Math.ceil(remaining / 1000);
  return (
    <div>
      <Progress done={index} total={total} />
      <p className="mt-5 text-xs tracking-[0.14em] text-accent uppercase">
        {question.pool === 'champion' ? 'Champion' : 'Item'} · {index + 1} of {total}
      </p>
      <h1 className="lol-display mt-1 mb-5 text-[clamp(1.5rem,6vw,2rem)] leading-tight font-semibold">{question.prompt}</h1>
      <div
        className="h-1.5 overflow-hidden rounded-full bg-line"
        role="progressbar"
        aria-label="Seconds left"
        aria-valuemin={0}
        aria-valuemax={PROMPT_MS / 1000}
        aria-valuenow={seconds}
      >
        <i
          className="block h-full bg-gradient-to-r from-accent to-[#f0d58a] transition-[width] duration-300 ease-linear motion-reduce:transition-none"
          style={{ width: `${(remaining / PROMPT_MS) * 100}%` }}
        />
      </div>
      <p
        className={`mt-1 mb-4 text-right text-sm tabular-nums ${seconds <= LOW_TIME_S ? 'text-[var(--tier-challenger)]' : 'text-muted'}`}
      >
        {seconds}s
      </p>
      <AnswerInput key={question.id} pool={question.pool} entries={entries} onSubmit={onSubmit} />
    </div>
  );
}
