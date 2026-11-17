import { useEffect } from 'react';
import type { Question } from '../data/questions';
import type { Entry } from '../data/types';
import { PROMPT_MS } from '../engine/game';
import { play } from '../sound';
import AnswerInput from './AnswerInput';

interface Props {
  question: Question;
  index: number;
  total: number;
  remaining: number;
  entries: readonly Entry[];
  /** Returns false for a wrong guess, which keeps the prompt open. */
  onSubmit: (entry: Entry, input: string) => boolean;
}

export function Progress({ done, total }: { done: number; total: number }) {
  return (
    <div className="lol-progress flex gap-1.5" aria-hidden="true">
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={`h-1 flex-1 ${i < done ? 'is-done' : ''}`} />
      ))}
    </div>
  );
}

const LOW_TIME_S = 5;
const ANNOUNCE_AT = [10, 5];

export default function QuestionCard({ question, index, total, remaining, entries, onSubmit }: Props) {
  const seconds = Math.ceil(remaining / 1000);
  const low = seconds <= LOW_TIME_S;
  const promptId = `prompt-${question.id}`;

  useEffect(() => {
    if (seconds > 0 && seconds <= LOW_TIME_S) play('tick');
  }, [seconds]);

  return (
    <div>
      <Progress done={index} total={total} />
      <p className="lol-display mt-[clamp(0.75rem,2.5cqh,1.5rem)] text-sm text-accent">
        {question.pool === 'champion' ? 'Champion' : 'Item'} prompt {index + 1} of {total}
      </p>
      <h1 id={promptId} className="lol-display mt-1 mb-[clamp(0.75rem,2.5cqh,1.5rem)] text-[clamp(1.25rem,min(6vw,4.5cqh),2rem)] leading-tight font-semibold">
        {question.prompt}
      </h1>
      <div
        className={`lol-timer ${low ? 'is-low' : ''}`}
        role="progressbar"
        aria-label="Seconds left"
        aria-valuemin={0}
        aria-valuemax={PROMPT_MS / 1000}
        aria-valuenow={seconds}
      >
        <i style={{ width: `${(remaining / PROMPT_MS) * 100}%` }} />
      </div>
      <p className={`mt-1.5 mb-4 text-right text-sm tabular-nums ${low ? 'text-[var(--wrong)]' : 'text-muted'}`}>
        {seconds}s
      </p>
      {/* Spoken only at a few points, so screen readers aren't flooded every second. */}
      <p className="sr-only" aria-live="polite">
        {ANNOUNCE_AT.includes(seconds) ? `${seconds} seconds left` : ''}
      </p>
      <AnswerInput key={question.id} pool={question.pool} entries={entries} onSubmit={onSubmit} describedBy={promptId} />
    </div>
  );
}
