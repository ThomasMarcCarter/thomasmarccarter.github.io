import { useId, useMemo, useState, type KeyboardEvent } from 'react';
import type { Entry } from '../data/types';
import type { Question } from '../data/questions';
import { matchAnswer, suggest } from '../engine/match';
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

/** Combobox over every entry in the pool, so suggestions never reveal which answers are right. */
export default function AnswerInput({ pool, entries, onSubmit, describedBy }: Props) {
  const id = useId();
  const [input, setInput] = useState('');
  // -1 means "whatever Enter would match", which may be nothing when two spellings tie.
  const [active, setActive] = useState(-1);
  const [hint, setHint] = useState('');
  const [wrong, setWrong] = useState(false);
  // Bumped on every wrong guess so the shake animation restarts even for repeat misses.
  const [shakes, setShakes] = useState(0);
  const options = useMemo(() => suggest(input, entries), [input, entries]);
  const best = useMemo(() => matchAnswer(input, entries), [input, entries]);
  const highlighted = active >= 0 ? options[active] : best;
  const highlightedIndex = highlighted ? options.indexOf(highlighted) : -1;

  const reset = () => {
    setInput('');
    setActive(-1);
  };

  const choose = (entry: Entry | null | undefined) => {
    if (!entry) {
      if (input.trim()) setHint('No exact match. Pick one of the suggestions.');
      return;
    }
    if (onSubmit(entry, input)) return;
    play('wrong');
    setWrong(true);
    setShakes((n) => n + 1);
    setHint(`${entry.name} isn’t a right answer. Try another.`);
    reset();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!options.length) return;
      const step = e.key === 'ArrowDown' ? 1 : -1;
      // With nothing highlighted, Down goes to the first suggestion and Up to the last.
      const from = highlightedIndex === -1 && step < 0 ? options.length : highlightedIndex;
      setActive((from + step + options.length) % options.length);
      play('select');
    } else if (e.key === 'Enter') {
      e.preventDefault();
      choose(highlighted);
    } else if (e.key === 'Escape') {
      reset();
      setHint('');
    }
  };

  const listId = `${id}-list`;
  const optionId = (i: number) => `${id}-opt-${i}`;

  return (
    <div>
      <input
        key={shakes}
        type="text"
        role="combobox"
        aria-label={pool === 'champion' ? 'Your answer: a champion' : 'Your answer: an item'}
        aria-expanded={options.length > 0}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={highlightedIndex >= 0 ? optionId(highlightedIndex) : undefined}
        aria-describedby={`${describedBy} ${id}-hint`}
        aria-invalid={wrong}
        autoComplete="off"
        autoCapitalize="off"
        spellCheck={false}
        autoFocus
        value={input}
        placeholder={pool === 'champion' ? 'Type a champion' : 'Type an item'}
        onChange={(e) => {
          setInput(e.target.value);
          setActive(-1);
          setHint('');
          setWrong(false);
        }}
        onKeyDown={onKeyDown}
        className={`lol-input w-full px-4 py-3.5 text-lg text-ink placeholder:text-muted ${shakes && wrong ? 'lol-shake' : ''}`}
      />
      <ul id={listId} role="listbox" aria-label="Suggestions" className="lol-suggestions empty:hidden">
        {options.map((entry, i) => (
          <li
            key={entry.id}
            id={optionId(i)}
            role="option"
            aria-selected={i === highlightedIndex}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => choose(entry)}
            className="lol-option flex min-h-13 cursor-pointer items-center gap-3 px-3 py-2"
          >
            <img src={iconUrl(pool, entry.icon)} alt="" width={32} height={32} />
            {entry.name}
            {i === highlightedIndex && <kbd className="ml-auto text-xs text-muted">Enter</kbd>}
          </li>
        ))}
      </ul>
      <p
        id={`${id}-hint`}
        role="status"
        className={`mt-2 min-h-5 text-sm ${wrong ? 'text-[var(--wrong)]' : 'text-muted'}`}
      >
        {hint}
      </p>
    </div>
  );
}
