import { SocialPublishingSoundModeOption } from "@/app/_components/socialPublishing/SocialPublishingSoundModeOption";
import type { SocialPublishingSoundMode } from "@/lib/clipstitchr/types/SocialPublishingSoundMode";

type SocialPublishingSoundModePickerProps = {
  disabled: boolean;
  value: SocialPublishingSoundMode;
  onChange: (value: SocialPublishingSoundMode) => void;
};

const socialPublishingSoundModeLabels: Record<SocialPublishingSoundMode, string> = {
  manual: "Choose",
  none: "No sound",
};

export function SocialPublishingSoundModePicker({
  disabled,
  value,
  onChange,
}: SocialPublishingSoundModePickerProps) {
  return (
    <fieldset className="grid gap-2">
      <legend className="text-sm font-bold text-text-primary">Sound</legend>
      <div className="grid gap-2 sm:grid-cols-2">
        {(["manual", "none"] as SocialPublishingSoundMode[]).map((mode) => (
          <SocialPublishingSoundModeOption
            key={mode}
            checked={value === mode}
            disabled={disabled}
            label={socialPublishingSoundModeLabels[mode]}
            value={mode}
            onChange={onChange}
          />
        ))}
      </div>
    </fieldset>
  );
}
