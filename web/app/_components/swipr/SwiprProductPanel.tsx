import { Boxes, Plus, Sparkles, Wand2 } from "lucide-react";
import { SelectInput } from "@/app/_components/ui/SelectInput";
import { SwiprDraftGenerationCountControl } from "@/app/_components/swipr/SwiprDraftGenerationCountControl";
import { SwiprTextGenerationScopeToggle } from "@/app/_components/swipr/SwiprTextGenerationScopeToggle";
import { Button } from "@/app/_components/ui/Button";
import type { SwiprTextGenerationScope } from "@/lib/clipstitchr/types/SwiprTextGenerationScope";

type SwiprProductOption = {
  value: string;
  label: string;
};

type SwiprProductPanelProps = {
  canAddSlide: boolean;
  draftGenerationCount: number;
  productOptions: SwiprProductOption[];
  selectedProductId: string;
  slideCount: number;
  textGenerationScope: SwiprTextGenerationScope;
  isGeneratingDrafts: boolean;
  isGeneratingText: boolean;
  onAddSlide: () => void;
  onDraftGenerationCountChange: (count: number) => void;
  onGenerateDrafts: () => void;
  onProductChange: (productId: string) => void;
  onGenerateText: () => void;
  onTextGenerationScopeChange: (scope: SwiprTextGenerationScope) => void;
};

export function SwiprProductPanel({
  canAddSlide,
  draftGenerationCount,
  productOptions,
  selectedProductId,
  slideCount,
  textGenerationScope,
  isGeneratingDrafts,
  isGeneratingText,
  onAddSlide,
  onDraftGenerationCountChange,
  onGenerateDrafts,
  onProductChange,
  onGenerateText,
  onTextGenerationScopeChange,
}: SwiprProductPanelProps) {
  const hasProducts = productOptions.length > 0;

  return (
    <section>
      <div className="mb-3 flex items-center gap-3">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-surface-muted text-accent">
          <Boxes aria-hidden className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm font-semibold text-accent-dark">Product</p>
          <h2 className="mt-0.5 text-base font-bold text-text-primary">
            Context
          </h2>
        </div>
      </div>
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <SelectInput
          label="Product"
          value={selectedProductId}
          options={productOptions}
          disabled={!hasProducts}
          onChange={(event) => onProductChange(event.target.value)}
        />
        {!hasProducts ? (
          <p className="rounded-lg border border-border bg-surface-elevated px-3 py-2 text-sm font-semibold text-text-secondary">
            Save a product in Settings before creating a Swipe.
          </p>
        ) : null}
        <Button
          type="button"
          variant="secondary"
          size="sm"
          icon={<Plus aria-hidden className="h-4 w-4" />}
          disabled={!canAddSlide}
          onClick={onAddSlide}
        >
          Add slide
        </Button>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <SwiprDraftGenerationCountControl
          value={draftGenerationCount}
          disabled={!hasProducts || isGeneratingDrafts}
          onChange={onDraftGenerationCountChange}
        />
        <Button
          type="button"
          variant="secondary"
          size="sm"
          icon={<Sparkles aria-hidden className="h-4 w-4" />}
          disabled={!hasProducts}
          isLoading={isGeneratingDrafts}
          onClick={onGenerateDrafts}
        >
          Generate drafts
        </Button>
        <SwiprTextGenerationScopeToggle
          value={textGenerationScope}
          onChange={onTextGenerationScopeChange}
        />
        <Button
          type="button"
          variant="secondary"
          size="sm"
          icon={<Wand2 aria-hidden className="h-4 w-4" />}
          disabled={!hasProducts || !slideCount}
          isLoading={isGeneratingText}
          onClick={onGenerateText}
        >
          Generate text
        </Button>
      </div>
    </section>
  );
}
