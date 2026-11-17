import { useRef } from 'react';
import { tiers } from '../engine/tiers';
import { play } from '../sound';
import TierBadge from './TierBadge';

/** Rules in a native dialog: focus trapping and Escape come with it. */
export default function HowToPlay({ className = 'lol-button-ghost' }: { className?: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  return (
    <>
      <button
        type="button"
        className={className}
        onClick={() => {
          play('open');
          dialog.current?.showModal();
        }}
      >
        How to play
      </button>
      {/* Padding sits on the inner div, so only a click on the backdrop reaches the dialog itself and closes it. */}
      <dialog
        ref={dialog}
        aria-labelledby="how-to-play-title"
        className="lol-panel m-auto max-h-[calc(100dvh-2rem)] w-[min(32rem,calc(100%-2rem))] overflow-y-auto p-0 text-ink backdrop:bg-black/70 backdrop:backdrop-blur-sm"
        onClick={(e) => e.target === dialog.current && dialog.current.close()}
      >
        <div className="p-6">
          <h2 id="how-to-play-title" className="lol-display text-2xl font-bold text-accent">
            How to play
          </h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 marker:text-accent">
            <li>Every day there are 7 prompts: 4 about champions and 3 about items. Everyone gets the same ones.</li>
            <li>
              You have 25 seconds per prompt. Type a name and press Enter; if it looks like a typo you will be asked to confirm it.
            </li>
            <li>A wrong guess only costs time: keep guessing until you find a right answer.</li>
            <li>Any right answer gains LP. The fewer players who would think of it, the more LP it is worth.</li>
            <li>If the timer runs out, that prompt gains nothing.</li>
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
          <p className="mt-5 text-xs leading-relaxed text-muted">
            Lolillion isn't endorsed by Riot Games and doesn't reflect the views or opinions of Riot Games or anyone
            officially involved in producing or managing Riot Games properties. Riot Games, and all associated properties
            are trademarks or registered trademarks of Riot Games, Inc.
          </p>
          <form method="dialog" className="mt-5">
            <button className="lol-button">Got it</button>
          </form>
        </div>
      </dialog>
    </>
  );
}
