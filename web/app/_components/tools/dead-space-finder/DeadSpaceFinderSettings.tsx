import type { DeadSpaceAnalysisOptions } from "@/lib/clipstitchr/tools/deadSpaceFinder/DeadSpaceAnalysisOptions";

type DeadSpaceFinderSettingsProps = {
  disabled: boolean;
  onChange: (options: DeadSpaceAnalysisOptions) => void;
  value: DeadSpaceAnalysisOptions;
};

export function DeadSpaceFinderSettings({
  disabled,
  onChange,
  value,
}: DeadSpaceFinderSettingsProps) {
  return (
    <div className="marketing-card grid gap-4 p-5 md:p-6">
      <div>
        <h2 className="marketing-subheading text-2xl text-text-primary">
          Review sensitivity
        </h2>
        <p className="mt-2 text-sm leading-6 text-text-secondary">
          Start balanced. Increase sensitivity when you want more possible spans
          to inspect.
        </p>
      </div>
      <label className="grid gap-2 text-sm font-semibold text-text-primary">
        Visual sensitivity: {Math.round(value.visualThreshold * 1000) / 10}%
        change
        <input
          disabled={disabled}
          max="0.1"
          min="0.015"
          onChange={(event) =>
            onChange({
              ...value,
              visualThreshold: Number(event.currentTarget.value),
            })
          }
          step="0.005"
          type="range"
          value={value.visualThreshold}
        />
      </label>
      <label className="grid gap-2 text-sm font-semibold text-text-primary">
        Audio sensitivity: RMS {value.audioThreshold.toFixed(3)}
        <input
          disabled={disabled}
          max="0.08"
          min="0.005"
          onChange={(event) =>
            onChange({
              ...value,
              audioThreshold: Number(event.currentTarget.value),
            })
          }
          step="0.005"
          type="range"
          value={value.audioThreshold}
        />
      </label>
      <label className="grid gap-2 text-sm font-semibold text-text-primary">
        Minimum span
        <select
          className="h-11 rounded-lg border border-border bg-white px-3"
          disabled={disabled}
          onChange={(event) =>
            onChange({
              ...value,
              minimumSpanSeconds: Number(event.currentTarget.value),
            })
          }
          value={value.minimumSpanSeconds}
        >
          <option value="1">1 second</option>
          <option value="1.5">1.5 seconds</option>
          <option value="2">2 seconds</option>
          <option value="3">3 seconds</option>
        </select>
      </label>
    </div>
  );
}
