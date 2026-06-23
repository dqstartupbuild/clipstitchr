"use client";

import { Save } from "lucide-react";
import { useState } from "react";
import { ProductHookMemoryFields } from "@/app/_components/settings/ProductHookMemoryFields";
import { Button } from "@/app/_components/ui/Button";
import type { HookEdgeLevel } from "@/lib/clipstitchr/types/HookEdgeLevel";
import type { HookGenerationGoal } from "@/lib/clipstitchr/types/HookGenerationGoal";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";
import type { ProductProfileCreateInput } from "@/lib/clipstitchr/types/ProductProfileCreateInput";
import { createProductProfileInputFromProduct } from "@/lib/clipstitchr/utils/createProductProfileInputFromProduct";
import { formatProductHookExamplesText } from "@/lib/clipstitchr/utils/formatProductHookExamplesText";
import { parseProductHookExamplesText } from "@/lib/clipstitchr/utils/parseProductHookExamplesText";

type SettingsHookLabFormProps = {
  isSaving: boolean;
  product: ProductProfile;
  onUpdate: (id: string, input: ProductProfileCreateInput) => Promise<unknown>;
};

export function SettingsHookLabForm({
  isSaving,
  product,
  onUpdate,
}: SettingsHookLabFormProps) {
  const [winningHookExamplesText, setWinningHookExamplesText] = useState(
    formatProductHookExamplesText(product.winningHookExamples),
  );
  const [rejectedHookExamplesText, setRejectedHookExamplesText] = useState(
    formatProductHookExamplesText(product.rejectedHookExamples),
  );
  const [hookGenerationGoal, setHookGenerationGoal] =
    useState<HookGenerationGoal>(product.hookGenerationGoal ?? "views");
  const [hookEdgeLevel, setHookEdgeLevel] = useState<HookEdgeLevel>(
    product.hookEdgeLevel ?? "punchy",
  );

  return (
    <div className="flex flex-col gap-4">
      <ProductHookMemoryFields
        hookEdgeLevel={hookEdgeLevel}
        hookGenerationGoal={hookGenerationGoal}
        rejectedHookExamplesText={rejectedHookExamplesText}
        winningHookExamplesText={winningHookExamplesText}
        onHookEdgeLevelChange={setHookEdgeLevel}
        onHookGenerationGoalChange={setHookGenerationGoal}
        onRejectedHookExamplesTextChange={setRejectedHookExamplesText}
        onWinningHookExamplesTextChange={setWinningHookExamplesText}
      />
      <div className="flex justify-end">
        <Button
          type="button"
          size="sm"
          icon={<Save aria-hidden className="h-4 w-4" />}
          isLoading={isSaving}
          onClick={() =>
            onUpdate(product.id, {
              ...createProductProfileInputFromProduct(product),
              hookEdgeLevel,
              hookGenerationGoal,
              rejectedHookExamples: parseProductHookExamplesText(
                rejectedHookExamplesText,
              ),
              winningHookExamples: parseProductHookExamplesText(
                winningHookExamplesText,
              ),
            })
          }
        >
          Save Hook Lab
        </Button>
      </div>
    </div>
  );
}
