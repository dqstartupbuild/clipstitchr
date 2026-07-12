import { CheckCircle2, CircleAlert, Clock3 } from "lucide-react";
import type { HookLabIdeaUseVariant } from "@/lib/clipstitchr/types/HookLabIdeaUseVariant";
import { getHookLabIdeaVariantStatusLabel } from "@/lib/clipstitchr/utils/getHookLabIdeaVariantStatusLabel";

type HookLabIdeaUseVariantRowProps = {
  variant: HookLabIdeaUseVariant;
};

export function HookLabIdeaUseVariantRow({
  variant,
}: HookLabIdeaUseVariantRowProps) {
  return (
    <li className="flex items-center gap-2 rounded-md border border-border bg-white px-3 py-2">
      {variant.status === "completed" ? (
        <CheckCircle2 aria-hidden className="size-4 shrink-0 text-emerald-600" />
      ) : variant.status === "failed" ? (
        <CircleAlert aria-hidden className="size-4 shrink-0 text-red-600" />
      ) : (
        <Clock3 aria-hidden className="size-4 shrink-0 text-text-tertiary" />
      )}
      <div className="min-w-0">
        <p className="text-xs font-bold text-text-primary tabular-nums">
          Version {variant.variantIndex + 1}
        </p>
        <p className="truncate text-xs text-text-secondary">
          {getHookLabIdeaVariantStatusLabel(variant.status)}
        </p>
      </div>
    </li>
  );
}
