import { useId, useState, type SubmitEvent } from 'react';
import type { Entry } from '../data/types';
import type { Question } from '../data/questions';
import { resolveAnswer } from '../engine/match';
import { play } from '../sound';
import { iconUrl } from './icons';

interface Props {
  pool: Question['pool'];
  entries: readonly Entry[];
  /** Returns false for a wrong guess, which keeps the prompt open. */
  onSubmit: (entry: Entry, input: string) => boolean;
  /** Id of the prompt text, read out when the input gets focus. */
  describedBy: string;
}

type Feedback =
  | { kind: 'guess'; entry: Entry }
  | { kind: 'wrong'; text: string }
  | { kind: 'info'; text: string }
  | null;

const MAX_LISTED = 4;

const listNames = (entries: Entry[]) =>
  entries.length === 2
    ? `${entries[0].name} or ${entries[1].name}`
    : `${entries.slice(0, -1).map((e) => e.name).join(', ')} or ${entries.at(-1)!.name}`;

/** Free-text answer box. No suggestions: exact names submit, near misses ask "Did you mean…?" first. */
export default function AnswerInput({ pool, entries, onSubmit, describedBy }: Props) {
  const id = useId();
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState<Feedback>(null);
  // Bumped on every wrong answer so the shake animation restarts even for repeat misses.
  const [shakes, setShakes] = useState(0);
  const noun = pool === 'champion' ? 'champion' : 'item';

  const answer = (entry: Entry) => {
    if (onSubmit(entry, input)) return;
    play('wrong');
    setShakes((n) => n + 1);
    setFeedback({ kind: 'wrong', text: `${entry.name} isn’t a right answer. Try another.` });
    setInput('');
  };

  const submit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Second Enter on an unchanged "Did you mean" confirms it.
    if (feedback?.kind === 'guess') return answer(feedback.entry);

    const r = resolveAnswer(input, entries);
    if (r.kind === 'exact') return answer(r.entry);
    if (r.kind === 'guess') {
      play('select');
      return setFeedback({ kind: 'guess', entry: r.entry });
    }
    if (r.kind === 'ambiguous') {
      const text =
        r.entries.length <= MAX_LISTED
          ? `Did you mean ${listNames(r.entries)}? Type a little more.`
          : `${r.entries.length} ${noun}s start with that. Type a little more.`;
      return setFeedback({ kind: 'info', text });
    }
    if (input.trim()) setFeedback({ kind: 'info', text: `No ${noun} called “${input.trim()}”. Check the spelling.` });
  };

  const feedbackId = `${id}-feedback`;

  return (
    <form onSubmit={submit} noValidate>
      <div id={feedbackId} role="status" className="mb-2 min-h-12 text-sm">
        {feedback?.kind === 'guess' && (
          <button
            type="button"
            onClick={() => answer(feedback.entry)}
            className="lol-guess flex w-full items-center gap-3 px-3 py-2 text-left"
          >
            <img src={iconUrl(pool, feedback.entry.icon)} alt="" width={32} height={32} />
            <span>
              Did you mean <b className="text-ink">{feedback.entry.name}</b>?
              <span className="block text-xs text-muted">Press Enter again or tap here to answer.</span>
            </span>
          </button>
        )}
        {feedback?.kind === 'wrong' && <p className="pt-3 text-[var(--wrong)]">{feedback.text}</p>}
        {feedback?.kind === 'info' && <p className="pt-3 text-muted">{feedback.text}</p>}
      </div>
      <input
        key={shakes}
        type="text"
        enterKeyHint="go"
        aria-label={`Your answer: a ${noun}`}
        aria-describedby={`${describedBy} ${feedbackId}`}
        aria-invalid={feedback?.kind === 'wrong'}
        autoComplete="off"
        autoCapitalize="off"
        spellCheck={false}
        autoFocus
        value={input}
        placeholder={`Type a ${noun}`}
        onChange={(e) => {
          setInput(e.target.value);
          setFeedback(null);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            setInput('');
            setFeedback(null);
          }
        }}
        className={`lol-input w-full px-4 py-[clamp(0.6rem,2cqh,0.875rem)] text-lg text-ink placeholder:text-muted ${
          shakes && feedback?.kind === 'wrong' ? 'lol-shake' : ''
        }`}
      />
    </form>
  );
}
