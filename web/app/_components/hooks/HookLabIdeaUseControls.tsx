"use client";

import { Sparkles } from "lucide-react";
import { Button } from "@/app/_components/ui/Button";
import { SelectInput } from "@/app/_components/ui/SelectInput";
import type { HookLabIdeaVariationCount } from "@/lib/clipstitchr/types/HookLabIdeaVariationCount";

type HookLabIdeaUseControlsProps = {
  disabled: boolean;
  isUsing: boolean;
  variationCount: HookLabIdeaVariationCount;
  onUse: () => void;
  onVariationCountChange: (count: HookLabIdeaVariationCount) => void;
};

export function HookLabIdeaUseControls({
  disabled,
  isUsing,
  variationCount,
  onUse,
  onVariationCountChange,
}: HookLabIdeaUseControlsProps) {
  return (
    <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
      <SelectInput
        label="Number of versions"
        value={String(variationCount)}
        options={[
          { label: "1 version", value: "1" },
          { label: "3 versions", value: "3" },
          { label: "5 versions", value: "5" },
        ]}
        disabled={disabled || isUsing}
        onChange={(event) =>
          onVariationCountChange(
            Number(event.currentTarget.value) as HookLabIdeaVariationCount,
          )
        }
      />
      <Button
        type="button"
        icon={<Sparkles aria-hidden className="size-4" />}
        disabled={disabled}
        isLoading={isUsing}
        onClick={onUse}
      >
        Use idea
      </Button>
    </div>
  );
}
