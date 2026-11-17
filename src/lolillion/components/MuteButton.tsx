import { useState } from 'react';
import { isMuted, play, setMuted } from '../sound';

export default function MuteButton() {
  const [muted, setState] = useState(isMuted);
  const toggle = () => {
    setMuted(!muted);
    setState(!muted);
    if (muted) play('click');
  };
  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={!muted}
      aria-label="Sound effects"
      title={muted ? 'Turn sound on' : 'Turn sound off'}
      className="grid h-10 w-10 place-items-center rounded-full border border-accent/40 text-accent transition hover:border-accent hover:bg-accent/10"
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
        <path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor" />
        {muted ? (
          <path d="M17 9l5 6m0-6l-5 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" fill="none" />
        ) : (
          <path
            d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            fill="none"
          />
        )}
      </svg>
    </button>
  );
}
