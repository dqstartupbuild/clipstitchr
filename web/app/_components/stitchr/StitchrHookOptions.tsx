import type { StitchrHookOption } from "@/lib/clipstitchr/types/StitchrHookOption";

export function StitchrHookOptions({
  options,
  selectedText,
  onSelect,
}: {
  options: StitchrHookOption[];
  selectedText: string;
  onSelect: (option: StitchrHookOption) => void;
}) {
  if (options.length < 2) {
    return null;
  }

  return (
    <fieldset className="mt-4">
      <legend className="text-sm font-semibold text-text-primary">
        Choose a hook angle
      </legend>
      <div className="mt-3 grid gap-3">
        {options.map((option) => (
          <label
            className="grid cursor-pointer grid-cols-[auto_minmax(0,1fr)] items-start gap-3"
            key={`${option.templateId}-${option.text}`}
          >
            <input
              checked={selectedText === option.text}
              className="mt-1 h-4 w-4 accent-accent"
              name="stitchr-hook-option"
              type="radio"
              onChange={() => onSelect(option)}
            />
            <span>
              <span className="block text-sm font-semibold text-text-primary">
                {option.angle}
              </span>
              <span className="mt-1 block text-sm leading-6 text-text-secondary">
                {option.text}
              </span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
