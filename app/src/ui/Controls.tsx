/** Settings controls from the design: an on/off toggle and a segmented choice. */

export function Toggle({ on, label, onChange }: { on: boolean; label: string; onChange: (on: boolean) => void }) {
  return (
    <button
      type="button"
      className={on ? 'tog on' : 'tog'}
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
    />
  );
}

export interface SegmentOption<T> {
  readonly value: T;
  readonly label: string;
}

export function Segmented<T extends string | number>({
  value,
  options,
  label,
  onChange,
}: {
  value: T;
  options: readonly SegmentOption<T>[];
  label: string;
  onChange: (value: T) => void;
}) {
  return (
    <div className="seg" role="group" aria-label={label}>
      {options.map((o) => (
        <button
          key={String(o.value)}
          type="button"
          className={o.value === value ? 'on' : ''}
          aria-pressed={o.value === value}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
