import { plain } from '../../../copy';
import type { CSSProperties } from 'react';
import type { CellIndex, Geometry } from '../../../engine';
import { Icon } from '../../../ui/Icon';
import type { CellView } from '../model/board';
import '../styles/board.css';

export interface BoardProps {
  readonly cells: readonly CellView[];
  readonly onFlip: () => void;
  readonly onFilter: (cell: CellIndex) => void;
  /** Any tap on the board (the AI's word appearing: finish it at once). */
  readonly onTap?: () => void;
  /** The board's shape. Square when left out (the tutorial and the menu). */
  readonly geo?: Geometry;
}

/** Hex boards: a pointy-top hexagon is 2/sqrt(3) as tall as it is wide; rows sit 3/4 of that apart. */
const HEX_H = 2 / Math.sqrt(3);
const ROW_STEP = HEX_H * 0.75;
const TILE = 0.86;
const SLOT = 0.94;

/** Positions for a hex board's cells, as percentages of the board (see board.css, .board.hex). */
function hexLayout(geo: Geometry) {
  const n = geo.size;
  const R = (n - 1) / 2;
  const W = n;
  const H = HEX_H + 2 * R * ROW_STEP;
  const pct = (v: number, of: number) => `${(v / of) * 100}%`;
  const place = (index: number, size: number, tall: number): CSSProperties => {
    const r = Math.floor(index / n);
    const x = (2 * (index % n) + r - R) / 2; // left edge of the slot, in cell widths (axial q + r/2 + R)
    return {
      left: pct(x + (1 - size) / 2, W),
      top: pct(r * ROW_STEP + (HEX_H - tall) / 2, H),
      width: pct(size, W),
      height: pct(tall, H),
    };
  };
  return {
    style: { '--W': W, '--H': H, aspectRatio: `${W} / ${H}` } as CSSProperties,
    tile: (i: number) => place(i, TILE, TILE),
    slot: (i: number) => place(i, SLOT, SLOT * HEX_H),
  };
}

function CellContent({ cell }: { cell: CellView }) {
  return (
    <>
      <span className="l">{cell.letter}</span>
      {cell.mark && <span className="mk">{cell.mark}</span>}
      {cell.linkBadge && (
        <span className="gb">
          <Icon name="link" />
        </span>
      )}
    </>
  );
}

/** Cells you can act on (your letters, the preview) are buttons; the rest are labelled tiles. */
export function Board({ cells, onFlip, onFilter, onTap, geo }: BoardProps) {
  const hex = geo?.shape === 'hex' ? hexLayout(geo) : null;
  const shown = hex ? cells.filter((cell) => geo!.valid[cell.index]) : cells;
  return (
    <section className={hex ? 'boardwrap hexwrap' : 'boardwrap'} aria-label={plain('board.aria')} onClick={onTap}>
      <div className={hex ? 'board hex' : 'board'} style={hex?.style}>
        {hex && shown.map((cell) => <i key={`s${cell.index}`} className="hexslot" style={hex.slot(cell.index)} aria-hidden="true" />)}
        {shown.map((cell) => {
          const anim = cell.delay ? { animationDelay: `${cell.delay}ms` } : undefined;
          const style = hex ? { ...hex.tile(cell.index), ...anim } : anim;
          if (!cell.tap) {
            return (
              <div key={cell.index} className={cell.className} style={style} role="img" aria-label={cell.label}>
                <CellContent cell={cell} />
              </div>
            );
          }
          const onClick = cell.tap === 'flip' ? onFlip : () => onFilter(cell.index);
          return (
            <button
              key={cell.index}
              type="button"
              className={cell.className}
              style={style}
              aria-label={cell.label}
              onClick={onClick}
              onMouseDown={(e) => e.preventDefault()}
            >
              <CellContent cell={cell} />
            </button>
          );
        })}
      </div>
    </section>
  );
}
