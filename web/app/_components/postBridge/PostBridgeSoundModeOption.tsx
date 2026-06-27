import type { PostBridgeSoundMode } from "@/lib/clipstitchr/types/PostBridgeSoundMode";

type PostBridgeSoundModeOptionProps = {
  checked: boolean;
  disabled: boolean;
  label: string;
  value: PostBridgeSoundMode;
  onChange: (value: PostBridgeSoundMode) => void;
};

export function PostBridgeSoundModeOption({
  checked,
  disabled,
  label,
  value,
  onChange,
}: PostBridgeSoundModeOptionProps) {
  return (
    <label
      className={[
        "flex h-10 items-center justify-center rounded-lg border px-3 text-sm font-bold transition-colors",
        checked
          ? "border-accent bg-accent text-white"
          : "border-border bg-white text-text-primary hover:border-accent",
        disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
      ].join(" ")}
    >
      <input
        type="radio"
        name="post-bridge-sound-mode"
        value={value}
        checked={checked}
        disabled={disabled}
        className="sr-only"
        onChange={() => onChange(value)}
      />
      {label}
    </label>
  );
}
