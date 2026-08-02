type ProgressBarProps = {
  value: number;
};

export function ProgressBar({ value }: ProgressBarProps) {
  const width = `${Math.round(Math.max(0, Math.min(1, value)) * 100)}%`;

  return (
    <div className="h-2 overflow-hidden rounded-full bg-slate-200">
      <div
        className="h-full rounded-full bg-accent transition-all duration-300"
        style={{ width }}
      />
    </div>
  );
}
