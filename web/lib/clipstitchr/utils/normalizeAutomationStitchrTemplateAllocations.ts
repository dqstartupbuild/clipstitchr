import type { AutomationGenerationCount } from "../types/AutomationGenerationCount";
import type { AutomationStitchrTemplateAllocation } from "../types/AutomationStitchrTemplateAllocation";
import { getAutomationGenerationCount } from "./getAutomationGenerationCount";

export function normalizeAutomationStitchrTemplateAllocations(
  allocations: AutomationStitchrTemplateAllocation[] | undefined,
  generationCount: AutomationGenerationCount | number | undefined,
  allowedTemplateIds?: Set<string>,
) {
  const maxCount = getAutomationGenerationCount(generationCount);
  const countsByTemplateId = new Map<string, number>();
  const orderedTemplateIds: string[] = [];

  for (const allocation of allocations ?? []) {
    const templateId = allocation.templateId.trim();

    if (!templateId || allowedTemplateIds?.has(templateId) === false) {
      continue;
    }

    const nextCount = Math.max(
      0,
      Math.min(maxCount, Math.trunc(allocation.count)),
    );

    if (!Number.isFinite(nextCount) || nextCount <= 0) {
      continue;
    }

    if (!countsByTemplateId.has(templateId)) {
      orderedTemplateIds.push(templateId);
    }

    countsByTemplateId.set(
      templateId,
      (countsByTemplateId.get(templateId) ?? 0) + nextCount,
    );
  }

  let remainingCount = maxCount;

  return orderedTemplateIds.flatMap((templateId) => {
    const count = Math.min(
      countsByTemplateId.get(templateId) ?? 0,
      remainingCount,
    );

    remainingCount -= count;

    return count > 0 ? [{ templateId, count }] : [];
  });
}
