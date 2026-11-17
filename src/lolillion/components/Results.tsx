import { useEffect, useRef, useState } from 'react';
import type { Question } from '../data/questions';
import type { Entry } from '../data/types';
import { msUntilNextPuzzle, totalLp, type DayProgress } from '../engine/game';
import { rarestAnswer, scoreAnswer } from '../engine/score';
import { buildShareString } from '../engine/share';
import { useCountUp } from '../hooks/useCountUp';
import { useNow } from '../hooks/useNow';
import { play } from '../sound';
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
  const total = totalLp(questions, progress);
  const shownTotal = useCountUp(total);
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
      <p className="lol-display text-center text-sm text-accent">Puzzle #{number}</p>
      <h1
        ref={headingRef}
        tabIndex={-1}
        aria-label={`${total} LP`}
        className="lol-display lol-title mt-1 text-center text-6xl font-bold focus:outline-none"
      >
        {shownTotal} LP
      </h1>
      <ol className="mt-8 space-y-3">
        {rows.map(({ q, entry, tier, points }) => (
          <li key={q.id} className="lol-row grid grid-cols-[auto_1fr_auto] items-center gap-x-3 pb-3">
            <TierBadge tier={tier?.name ?? null} size={22} />
            <span>
              {q.prompt}: <b>{entry ? entry.name : 'time ran out'}</b>
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
        className="lol-share mt-6 p-3 font-mono text-sm whitespace-pre-wrap text-ink/80"
      >
        {share}
      </pre>
      <button
        type="button"
        className="lol-button mt-4"
        onClick={() => {
          play('copy');
          copy();
        }}
      >
        {copied ? 'Copied' : 'Copy result'}
      </button>
      <p className="mt-4 text-center text-sm text-muted">Next puzzle in {countdown(msUntilNextPuzzle(new Date(now)))}</p>
    </div>
  );
}
