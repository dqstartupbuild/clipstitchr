import { ChevronDown } from "lucide-react";
import type { SelectHTMLAttributes } from "react";

type SelectInputOption = {
  label: string;
  value: string;
};

type SelectInputProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  options: SelectInputOption[];
  wrapperClassName?: string;
};

export function SelectInput({
  label,
  options,
  wrapperClassName = "",
  className = "",
  ...props
}: SelectInputProps) {
  return (
    <label className={["block", wrapperClassName].filter(Boolean).join(" ")}>
      <span className="text-sm font-semibold text-text-primary">{label}</span>
      <span className="relative mt-2 block">
        <select
          className={[
            "h-10 w-full appearance-none rounded-lg border border-border bg-surface px-3 pr-10 text-sm font-semibold text-text-primary shadow-sm shadow-slate-200/50 outline-none transition-colors hover:border-accent/70 focus:border-accent focus:ring-2 focus:ring-accent/15",
            className,
          ]
            .filter(Boolean)
            .join(" ")}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          aria-hidden
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary"
        />
      </span>
    </label>
  );
}
