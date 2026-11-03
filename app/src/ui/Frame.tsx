/** The themed root of every screen. Theme and layout classes match the design's tokens.css. */

import type { ReactNode } from 'react';

export interface FrameProps {
  readonly theme: 'light' | 'dark';
  readonly layout: 'phone' | 'desk';
  /** Which player's colour drives --p (the active player's accents). */
  readonly accent: 0 | 1;
  readonly className?: string;
  readonly children: ReactNode;
}

export function Frame({ theme, layout, accent, className, children }: FrameProps) {
  const classes = ['wr', theme, layout, accent === 0 ? 'turnA' : 'turnB', className].filter(Boolean);
  return <div className={classes.join(' ')}>{children}</div>;
}
