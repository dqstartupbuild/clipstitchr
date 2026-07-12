import type { AutomationGenerationCount } from "@/lib/clipstitchr/types/AutomationGenerationCount";
import type { AutomationStitchrTemplateAllocation } from "@/lib/clipstitchr/types/AutomationStitchrTemplateAllocation";
import type { StitchTemplate } from "@/lib/clipstitchr/types/StitchTemplate";
import { normalizeAutomationStitchrTemplateAllocations } from "@/lib/clipstitchr/utils/normalizeAutomationStitchrTemplateAllocations";

type AutomationStitchrTemplateAllocationPickerProps = {
  allocations: AutomationStitchrTemplateAllocation[];
  disabled: boolean;
  generationCount: AutomationGenerationCount;
  templates: StitchTemplate[];
  onChange: (allocations: AutomationStitchrTemplateAllocation[]) => void;
};

function getAllocationCount(
  allocations: AutomationStitchrTemplateAllocation[],
  templateId: string,
) {
  return (
    allocations.find((allocation) => allocation.templateId === templateId)
      ?.count ?? 0
  );
}

export function AutomationStitchrTemplateAllocationPicker({
  allocations,
  disabled,
  generationCount,
  templates,
  onChange,
}: AutomationStitchrTemplateAllocationPickerProps) {
  const normalizedAllocations = normalizeAutomationStitchrTemplateAllocations(
    allocations,
    generationCount,
    new Set(templates.map((template) => template.id)),
  );
  const allocatedCount = normalizedAllocations.reduce(
    (total, allocation) => total + allocation.count,
    0,
  );
  const randomCount = Math.max(0, generationCount - allocatedCount);

  const handleTemplateCountChange = (templateId: string, count: number) => {
    const nextAllocations = templates
      .map((template) => ({
        templateId: template.id,
        count:
          template.id === templateId
            ? count
            : getAllocationCount(normalizedAllocations, template.id),
      }))
      .filter((allocation) => allocation.count > 0);

    onChange(
      normalizeAutomationStitchrTemplateAllocations(
        nextAllocations,
        generationCount,
        new Set(templates.map((template) => template.id)),
      ),
    );
  };

  return (
    <div className="grid gap-2">
      <p className="text-sm font-semibold text-text-primary">
        Saved setup Ideas
      </p>
      <div className="grid gap-2 rounded-lg border border-border bg-surface-muted p-3">
        <div className="flex min-h-10 items-center justify-between gap-3 rounded-lg bg-white px-3">
          <span className="text-sm font-semibold text-text-primary">
            Fresh setup
          </span>
          <span className="inline-flex h-7 min-w-8 items-center justify-center rounded-md border border-border bg-surface px-2 text-sm font-bold text-text-primary">
            {randomCount}
          </span>
        </div>
        {templates.length ? (
          templates.map((template) => {
            const count = getAllocationCount(
              normalizedAllocations,
              template.id,
            );

            return (
              <div
                key={template.id}
                className="flex min-h-10 items-center justify-between gap-3 rounded-lg bg-white px-3"
              >
                <span className="min-w-0 truncate text-sm font-semibold text-text-primary">
                  {template.name}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    aria-label={`Use fewer ${template.name} drafts`}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border text-sm font-bold text-text-secondary transition-colors hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={disabled || count <= 0}
                    onClick={() =>
                      handleTemplateCountChange(template.id, count - 1)
                    }
                  >
                    -
                  </button>
                  <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-md border border-border bg-surface px-2 text-sm font-bold text-text-primary">
                    {count}
                  </span>
                  <button
                    type="button"
                    aria-label={`Use more ${template.name} drafts`}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border text-sm font-bold text-text-secondary transition-colors hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={disabled || randomCount <= 0}
                    onClick={() =>
                      handleTemplateCountChange(template.id, count + 1)
                    }
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <p className="rounded-lg border border-border bg-white px-3 py-2 text-sm text-text-secondary">
            Save a Stitch as an Idea to reuse its setup here.
          </p>
        )}
      </div>
    </div>
  );
}
