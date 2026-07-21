import "server-only";

import { hookLibraryPageSize } from "@/lib/clipstitchr/constants/hookLibraryPageSize";
import { cliprHookStyles } from "@/lib/clipstitchr/resources/clipr/cliprHookStyles";
import { cliprHookTemplates } from "@/lib/clipstitchr/resources/clipr/cliprHookTemplates";
import type { HookLibraryQuery } from "@/lib/clipstitchr/types/HookLibraryQuery";
import type { HookLibraryResponse } from "@/lib/clipstitchr/types/HookLibraryResponse";

export function listHookLibraryTemplates({
  category,
  page,
  purpose,
  query,
  risk,
  trigger,
}: HookLibraryQuery): HookLibraryResponse {
  const normalizedQuery = query?.toLocaleLowerCase();
  const styleByKey = new Map(
    cliprHookStyles.map((style) => [style.styleKey, style]),
  );
  const filtered = cliprHookTemplates.filter((template) => {
    const style = styleByKey.get(template.styleKey);
    const searchableText = [
      template.template,
      style?.styleName,
      style?.sourceCategory,
      template.emotionalTrigger,
      ...template.bestFor,
    ]
      .filter(Boolean)
      .join(" ")
      .toLocaleLowerCase();

    return (
      (!category || template.styleKey === category) &&
      (!purpose || template.allowedPurposes.includes(purpose)) &&
      (!risk || template.riskLevel === risk) &&
      (!trigger || template.emotionalTrigger === trigger) &&
      (!normalizedQuery || searchableText.includes(normalizedQuery))
    );
  });
  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / hookLibraryPageSize));
  const resolvedPage = Math.min(page, totalPages);
  const offset = (resolvedPage - 1) * hookLibraryPageSize;

  return {
    categories: cliprHookStyles.map((style) => ({
      key: style.styleKey,
      name: style.styleName,
    })),
    items: filtered
      .slice(offset, offset + hookLibraryPageSize)
      .map((template) => ({
        bestFor: template.bestFor,
        categoryKey: template.styleKey,
        categoryName:
          styleByKey.get(template.styleKey)?.styleName ?? template.styleKey,
        emotionalTrigger: template.emotionalTrigger,
        id: template.id,
        purposes: template.allowedPurposes,
        requiredVariables: template.requiredVariables,
        riskLevel: template.riskLevel,
        template: template.template,
      })),
    page: resolvedPage,
    pageSize: hookLibraryPageSize,
    totalItems,
    totalPages,
    triggers: Array.from(
      new Set(cliprHookTemplates.map((template) => template.emotionalTrigger)),
    ).sort(),
  };
}
