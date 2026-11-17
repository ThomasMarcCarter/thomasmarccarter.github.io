import { useEffect, useRef, useState } from 'react';
import type { Question } from '../data/questions';
import type { Entry } from '../data/types';
import { msUntilNextPuzzle, totalLp, type DayProgress } from '../engine/game';
import { rarestAnswer, scoreAnswer } from '../engine/score';
import { buildShareString } from '../engine/share';
import { useNow } from '../hooks/useNow';
import TierBadge from './TierBadge';

interface Props {
  number: number;
  questions: Question[];
  progress: DayProgress;
  entryFor: (q: Question, id: string | null) => Entry | null;
}

const HOUR = 3_600_000;
const MINUTE = 60_000;
const countdown = (ms: number) => `${Math.floor(ms / HOUR)}h ${Math.floor((ms % HOUR) / MINUTE)}m`;

export default function Results({ number, questions, progress, entryFor }: Props) {
  const now = useNow(true, MINUTE / 2);
  const [copied, setCopied] = useState(false);
  const shareRef = useRef<HTMLPreElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  // The "See results" button just disappeared; move focus to the score rather than losing it to the page.
  useEffect(() => headingRef.current?.focus(), []);
  const rows = questions.map((q, i) => {
    const entryId = progress.answers[i]?.entryId ?? null;
    return { q, entry: entryFor(q, entryId), ...scoreAnswer(q, entryId) };
  });
  const share = buildShareString(
    { number, tiers: rows.map((r) => r.tier?.name ?? null) },
    `${location.origin}${location.pathname}`,
  );

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(share);
      setCopied(true);
    } catch {
      // No clipboard access: select the text so it can be copied by hand.
      const selection = getSelection();
      if (!shareRef.current || !selection) return;
      const range = document.createRange();
      range.selectNodeContents(shareRef.current);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  };

  return (
    <div>
      <p className="text-center text-xs tracking-[0.14em] text-accent uppercase">Lolillion #{number}</p>
      <h1
        ref={headingRef}
        tabIndex={-1}
        className="lol-display mt-1 text-center text-5xl font-bold text-accent focus:outline-none"
      >
        {totalLp(questions, progress)} LP
      </h1>
      <ol className="mt-6 space-y-3">
        {rows.map(({ q, entry, tier, points }) => (
          <li key={q.id} className="grid grid-cols-[auto_1fr_auto] items-center gap-x-3 border-b border-line pb-3">
            <TierBadge tier={tier?.name ?? null} size={20} />
            <span>
              {q.prompt} · <b>{entry ? entry.name : 'time up'}</b>
            </span>
            <span
              className="font-bold tabular-nums"
              style={{ color: tier ? `var(--tier-${tier.name.toLowerCase()})` : 'var(--muted)' }}
            >
              +{points}
            </span>
            <span className="col-start-2 col-end-4 text-sm text-muted">Rarest: {rarestAnswer(q).name}</span>
          </li>
        ))}
      </ol>
      <pre
        ref={shareRef}
        className="mt-6 border border-dashed border-line bg-[var(--panel)] p-3 font-mono text-sm whitespace-pre-wrap text-muted"
      >
        {share}
      </pre>
      <button type="button" className="lol-button mt-4" onClick={copy}>
        {copied ? 'Copied' : 'Copy result'}
      </button>
      <p className="mt-4 text-center text-sm text-muted">Next puzzle in {countdown(msUntilNextPuzzle(new Date(now)))}</p>
    </div>
  );
}
