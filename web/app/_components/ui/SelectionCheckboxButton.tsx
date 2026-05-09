import { Check } from "lucide-react";

type SelectionCheckboxButtonProps = {
  isSelected: boolean;
  label: string;
  onClick: () => void;
  className?: string;
};

export function SelectionCheckboxButton({
  isSelected,
  label,
  onClick,
  className = "",
}: SelectionCheckboxButtonProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={isSelected}
      aria-label={label}
      className={[
        "inline-flex h-6 w-6 items-center justify-center rounded-md border-[4px] shadow-[0_4px_12px_rgba(15,23,42,0.32)] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        isSelected
          ? "border-white/90 bg-accent text-white"
          : "border-white bg-white/90 text-transparent hover:bg-white hover:text-text-tertiary",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={onClick}
    >
      <Check aria-hidden className="h-3.5 w-3.5" />
    </button>
  );
}
