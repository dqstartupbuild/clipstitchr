import { PostBridgeSoundModeOption } from "@/app/_components/postBridge/PostBridgeSoundModeOption";
import type { PostBridgeSoundMode } from "@/lib/clipstitchr/types/PostBridgeSoundMode";

type PostBridgeSoundModePickerProps = {
  disabled: boolean;
  value: PostBridgeSoundMode;
  onChange: (value: PostBridgeSoundMode) => void;
};

const postBridgeSoundModeLabels: Record<PostBridgeSoundMode, string> = {
  manual: "Choose",
  none: "No sound",
};

export function PostBridgeSoundModePicker({
  disabled,
  value,
  onChange,
}: PostBridgeSoundModePickerProps) {
  return (
    <fieldset className="grid gap-2">
      <legend className="text-sm font-bold text-text-primary">Sound</legend>
      <div className="grid gap-2 sm:grid-cols-2">
        {(["manual", "none"] as PostBridgeSoundMode[]).map((mode) => (
          <PostBridgeSoundModeOption
            key={mode}
            checked={value === mode}
            disabled={disabled}
            label={postBridgeSoundModeLabels[mode]}
            value={mode}
            onChange={onChange}
          />
        ))}
      </div>
    </fieldset>
  );
}
