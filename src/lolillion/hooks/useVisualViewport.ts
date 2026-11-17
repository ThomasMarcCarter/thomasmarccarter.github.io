import { useEffect, useState } from 'react';

export interface VisibleArea {
  /** Height of the part of the page the player can see, in CSS pixels. */
  height: number;
  /** How far the browser has panned that area down the page (iOS does this when the keyboard opens). */
  top: number;
}

/**
 * The visible area of the page, which shrinks when an on-screen keyboard opens. `100dvh` doesn't: on iOS the
 * keyboard covers the bottom of the page instead of resizing it, so anything sized to the window ends up behind it.
 * Null until mounted.
 */
export function useVisualViewport(): VisibleArea | null {
  const [area, setArea] = useState<VisibleArea | null>(null);
  useEffect(() => {
    const vv = window.visualViewport;
    const update = () =>
      setArea((prev) => {
        const next = vv ? { height: vv.height, top: vv.offsetTop } : { height: innerHeight, top: 0 };
        return prev && prev.height === next.height && prev.top === next.top ? prev : next;
      });
    update();
    vv?.addEventListener('resize', update);
    vv?.addEventListener('scroll', update);
    addEventListener('resize', update);
    return () => {
      vv?.removeEventListener('resize', update);
      vv?.removeEventListener('scroll', update);
      removeEventListener('resize', update);
    };
  }, []);
  return area;
}
