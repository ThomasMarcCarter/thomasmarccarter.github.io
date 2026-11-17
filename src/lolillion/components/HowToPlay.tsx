import { useRef } from 'react';
import { tiers } from '../engine/tiers';
import TierBadge from './TierBadge';

/** Rules in a native dialog: focus trapping and Escape come with it. */
export default function HowToPlay({ className = 'lol-button-ghost' }: { className?: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  return (
    <>
      <button type="button" className={className} onClick={() => dialog.current?.showModal()}>
        How to play
      </button>
      <dialog
        ref={dialog}
        aria-labelledby="how-to-play-title"
        className="lol-frame m-auto w-[min(32rem,calc(100%-2rem))] bg-paper p-6 text-ink backdrop:bg-black/70"
        onClick={(e) => e.target === dialog.current && dialog.current.close()}
      >
        <h2 id="how-to-play-title" className="lol-display text-2xl font-bold text-accent">
          How to play
        </h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 marker:text-accent">
          <li>Every day there are 7 prompts: 4 about champions and 3 about items. Everyone gets the same ones.</li>
          <li>You have 25 seconds and one answer per prompt. Suggestions search everything, so they never give the answer away.</li>
          <li>Any right answer gains LP. The fewer players who would think of it, the more LP it is worth.</li>
          <li>A wrong answer or running out of time gains nothing.</li>
        </ul>
        <ul className="mt-5 grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-3">
          {tiers.map((t) => (
            <li key={t.name} className="flex items-center gap-2">
              <TierBadge tier={t.name} size={22} />
              <span>
                {t.name} <span className="text-muted">+{t.points}</span>
              </span>
            </li>
          ))}
        </ul>
        <form method="dialog" className="mt-6">
          <button className="lol-button">Got it</button>
        </form>
      </dialog>
    </>
  );
}
