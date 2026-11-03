/** Renders copy with **bold** markers. The only place that interprets the markup. */

import type { ReactNode } from 'react';

export interface RichTextProps {
  readonly text: string;
  /** How to draw the marked parts. Defaults to <b>; the desktop key help draws key caps. */
  readonly renderBold?: (part: string, key: number) => ReactNode;
}

const asBold = (part: string, key: number) => <b key={key}>{part}</b>;

export function RichText({ text, renderBold = asBold }: RichTextProps) {
  return <>{text.split('**').map((part, i) => (i % 2 === 1 ? renderBold(part, i) : part))}</>;
}
