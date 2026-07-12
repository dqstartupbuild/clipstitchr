import { Clapperboard, Film, Type } from "lucide-react";

type HookLabIdeaCapabilityChipsProps = {
  hasCreativeBeat: boolean;
  hasStitchRecipe: boolean;
  hasTextPattern: boolean;
};

export function HookLabIdeaCapabilityChips({
  hasCreativeBeat,
  hasStitchRecipe,
  hasTextPattern,
}: HookLabIdeaCapabilityChipsProps) {
  const capabilities = [
    ...(hasTextPattern
      ? [{ icon: Type, label: "Text pattern" }]
      : []),
    ...(hasCreativeBeat
      ? [{ icon: Clapperboard, label: "Creative beat" }]
      : []),
    ...(hasStitchRecipe
      ? [{ icon: Film, label: "Saved setup" }]
      : []),
  ];

  if (!capabilities.length) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2" aria-label="Idea capabilities">
      {capabilities.map(({ icon: Icon, label }) => (
        <span
          key={label}
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface-muted px-2 py-1 text-xs font-semibold text-text-secondary"
        >
          <Icon aria-hidden className="size-3.5" />
          {label}
        </span>
      ))}
    </div>
  );
}
