import { useEffect, useRef, useState } from 'react';
import type { Question } from '../data/questions';
import type { Entry } from '../data/types';
import { msUntilNextPuzzle, totalLp, type DayProgress } from '../engine/game';
import { finalRank, nextRank } from '../engine/ranks';
import { rarestAnswer, scoreAnswer } from '../engine/score';
import { buildShareString } from '../engine/share';
import { useCountUp } from '../hooks/useCountUp';
import { useNow } from '../hooks/useNow';
import { play } from '../sound';
import AnswerList from './AnswerList';
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
  const [openId, setOpenId] = useState<string | null>(null);
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
  const rank = finalRank(total);
  const next = nextRank(total);
  const rankColour = `var(--rank-${rank.name.toLowerCase()})`;

  useEffect(() => play(rank.name === 'Challenger' ? 'challenger' : rank.min >= 500 ? 'diamond' : 'gold'), [rank]);
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
        aria-label={`${rank.name}, ${total} LP`}
        className="focus:outline-none"
      >
        <span className="mt-2 grid place-items-center">
          <TierBadge tier={null} colour={rankColour} size="clamp(52px, 11cqh, 104px)" celebrate />
          <span className="lol-display mt-2 block text-[clamp(1.5rem,5cqh,2.25rem)] font-bold" style={{ color: rankColour }}>
            {rank.name}
          </span>
        </span>
        <span className="lol-display lol-title mt-1 block text-center text-[clamp(1.75rem,6cqh,3rem)] font-bold">{shownTotal} LP</span>
      </h1>
      {next && (
        <p className="mt-2 text-center text-sm text-muted">
          {next.min - total} LP short of {next.name}
        </p>
      )}
      <p className="mt-3 text-center text-sm text-muted">Select a prompt to see every right answer and its LP.</p>
      <ol className="mt-1">
        {rows.map(({ q, entry, tier, points }) => {
          const open = openId === q.id;
          return (
            <li key={q.id} className="lol-row">
              <button
                type="button"
                aria-expanded={open}
                aria-controls={`answers-${q.id}`}
                onClick={() => {
                  play('select');
                  setOpenId(open ? null : q.id);
                }}
                className="lol-row-button grid w-full grid-cols-[auto_1fr_auto_auto] items-center gap-x-3 py-2 text-left text-[0.95rem] leading-snug"
              >
                <TierBadge tier={tier?.name ?? null} size={22} />
                <span>
                  {q.prompt}: <b>{entry ? entry.name : 'time ran out'}</b>
                  <span className="block text-sm text-muted">Rarest: {rarestAnswer(q).name}</span>
                </span>
                <span
                  className="font-bold tabular-nums"
                  style={{ color: tier ? `var(--tier-${tier.name.toLowerCase()})` : 'var(--muted)' }}
                >
                  +{points}
                </span>
                <svg viewBox="0 0 16 16" className={`lol-chevron h-4 w-4 text-accent ${open ? 'is-open' : ''}`} aria-hidden="true">
                  <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </button>
              {open && <AnswerList id={`answers-${q.id}`} question={q} chosenId={entry?.id ?? null} />}
            </li>
          );
        })}
      </ol>
      <pre
        ref={shareRef}
        className="lol-share mt-4 p-3 font-mono text-sm whitespace-pre-wrap text-ink/80"
      >
        {share}
      </pre>
      <button
        type="button"
        className="lol-button mt-3"
        onClick={() => {
          play('copy');
          copy();
        }}
      >
        {copied ? 'Copied' : 'Copy result'}
      </button>
      <p className="mt-3 text-center text-sm text-muted">Next puzzle in {countdown(msUntilNextPuzzle(new Date(now)))}</p>
    </div>
  );
}
