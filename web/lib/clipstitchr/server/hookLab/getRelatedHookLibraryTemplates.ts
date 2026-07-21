import "server-only";

import { cliprHookStyles } from "@/lib/clipstitchr/resources/clipr/cliprHookStyles";
import { cliprHookTemplates } from "@/lib/clipstitchr/resources/clipr/cliprHookTemplates";
import type { HookLabFormatDna } from "@/lib/clipstitchr/types/HookLabFormatDna";
import type { HookLabDestinationTool } from "@/lib/clipstitchr/types/HookLabDestinationTool";
import type { HookLibraryTemplateSummary } from "@/lib/clipstitchr/types/HookLibraryTemplateSummary";
import { getPublicHookWords } from "@/lib/clipstitchr/tools/publicHooks/getPublicHookWords";

export function getRelatedHookLibraryTemplates(
  formatDna: HookLabFormatDna,
  destinationTool?: HookLabDestinationTool,
): HookLibraryTemplateSummary[] {
  const styleByKey = new Map(
    cliprHookStyles.map((style) => [style.styleKey, style]),
  );
  const formatWords = new Set(
    getPublicHookWords(
      [
        formatDna.hookPattern,
        formatDna.storyFramework,
        formatDna.openingQuestion,
        formatDna.firstPayoff,
        formatDna.proofDevice,
        formatDna.productRole,
        formatDna.retentionDevice,
      ].join(" "),
    ),
  );

  const ranked = cliprHookTemplates
    .filter(
      (template) =>
        template.active &&
        (!destinationTool || template.allowedPurposes.includes(destinationTool)),
    )
    .map((template) => {
      const style = styleByKey.get(template.styleKey);
      const candidateWords = getPublicHookWords(
        [
          template.template,
          template.emotionalTrigger,
          ...(template.bestFor ?? []),
          style?.styleName,
          style?.sourceCategory,
        ]
          .filter(Boolean)
          .join(" "),
      );
      const score = candidateWords.reduce(
        (total, word) => total + (formatWords.has(word) ? 1 : 0),
        0,
      );

      return { score, style, template };
    })
    .sort(
      (left, right) =>
        right.score - left.score || left.template.id.localeCompare(right.template.id),
    );
  const selected = ranked.reduce<typeof ranked>((items, candidate) => {
    if (
      items.length < 3 &&
      !items.some(
        (item) => item.template.styleKey === candidate.template.styleKey,
      )
    ) {
      items.push(candidate);
    }

    return items;
  }, []);

  return selected
    .map(({ style, template }) => ({
      bestFor: template.bestFor,
      categoryKey: template.styleKey,
      categoryName: style?.styleName ?? template.styleKey,
      emotionalTrigger: template.emotionalTrigger,
      id: template.id,
      purposes: template.allowedPurposes,
      requiredVariables: template.requiredVariables,
      riskLevel: template.riskLevel,
      template: template.template,
    }));
}
