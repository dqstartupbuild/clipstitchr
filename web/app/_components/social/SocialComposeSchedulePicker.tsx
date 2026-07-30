import type { SocialComposeScheduleDraft } from "@/lib/clipstitchr/social/types/SocialComposeScheduleDraft";

type SocialComposeSchedulePickerProps = {
  disabled: boolean;
  value: SocialComposeScheduleDraft;
  onChange: (value: SocialComposeScheduleDraft) => void;
};

export function SocialComposeSchedulePicker({
  disabled,
  value,
  onChange,
}: SocialComposeSchedulePickerProps) {
  return (
    <fieldset disabled={disabled}>
      <legend className="text-sm font-bold text-text-primary">When</legend>
      <div className="mt-2 grid gap-2 sm:grid-cols-3">
        {[
          { value: "now" as const, label: "Post now" },
          { value: "product_queue" as const, label: "Next product slot" },
          { value: "exact_time" as const, label: "Choose a time" },
        ].map((choice) => (
          <label
            key={choice.value}
            className="flex min-h-11 cursor-pointer items-center gap-2 rounded-lg bg-surface-muted px-3 text-sm font-semibold text-text-primary"
          >
            <input
              type="radio"
              name="social-schedule-mode"
              checked={value.mode === choice.value}
              onChange={() => onChange({ ...value, mode: choice.value })}
            />
            {choice.label}
          </label>
        ))}
      </div>
      {value.mode === "exact_time" ? (
        <label className="mt-3 grid gap-1 text-sm font-semibold text-text-primary">
          Local date and time
          <input
            type="datetime-local"
            className="min-h-10 rounded-lg border border-border bg-white px-3 text-sm"
            value={value.scheduledFor}
            onChange={(event) =>
              onChange({
                ...value,
                scheduledFor: event.currentTarget.value,
              })
            }
          />
        </label>
      ) : null}
    </fieldset>
  );
}
