import type { PostBridgePublishMode } from "@/lib/clipstitchr/types/PostBridgePublishMode";

type PostBridgePublishModePickerProps = {
  disabled: boolean;
  value: PostBridgePublishMode;
  onChange: (value: PostBridgePublishMode) => void;
};

const postBridgePublishModes: Array<{
  label: string;
  value: PostBridgePublishMode;
}> = [
  { label: "Post now", value: "now" },
  { label: "Schedule", value: "schedule" },
];

export function PostBridgePublishModePicker({
  disabled,
  value,
  onChange,
}: PostBridgePublishModePickerProps) {
  return (
    <fieldset className="grid gap-2">
      <legend className="text-sm font-bold text-text-primary">When to post</legend>
      <div
        aria-label="Post Bridge publish timing"
        className="inline-flex w-fit rounded-lg border border-border bg-slate-100 p-1"
        role="group"
      >
        {postBridgePublishModes.map((mode) => (
          <button
            key={mode.value}
            type="button"
            aria-pressed={value === mode.value}
            disabled={disabled}
            className={[
              "h-9 rounded-md px-3 text-sm font-semibold transition-colors",
              value === mode.value
                ? "bg-white text-accent shadow-sm"
                : "text-text-secondary hover:text-text-primary",
              disabled ? "cursor-not-allowed opacity-60" : "",
            ].join(" ")}
            onClick={() => onChange(mode.value)}
          >
            {mode.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
