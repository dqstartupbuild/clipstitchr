type ProgressBarProps = {
  ariaLabel?: string;
  value: number;
};

export function ProgressBar({ ariaLabel, value }: ProgressBarProps) {
  const width = `${Math.round(Math.max(0, Math.min(1, value)) * 100)}%`;

  return (
    <div
      aria-label={ariaLabel}
      aria-valuemax={100}
      aria-valuemin={0}
      aria-valuenow={Math.round(Math.max(0, Math.min(1, value)) * 100)}
      className="h-2 overflow-hidden rounded-full bg-surface-muted"
      role="progressbar"
    >
      <div
        className="h-full rounded-full bg-accent transition-all duration-300"
        style={{ width }}
      />
    </div>
  );
}
