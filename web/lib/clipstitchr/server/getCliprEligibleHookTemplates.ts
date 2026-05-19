import { cliprHookTemplates } from "@/lib/clipstitchr/resources/clipr/cliprHookTemplates";
import type { CliprHookTemplate } from "@/lib/clipstitchr/types/CliprHookTemplate";
import type { CliprTextPurpose } from "@/lib/clipstitchr/types/CliprTextPurpose";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";
import { getCliprTextHasForbiddenCta } from "@/lib/clipstitchr/utils/getCliprTextHasForbiddenCta";

function getTemplateMatchesProductPool({
  eligibleStyleKeys,
  eligibleTemplateIds,
  hasStylePool,
  hasTemplatePool,
  template,
}: {
  eligibleStyleKeys: Set<string>;
  eligibleTemplateIds: Set<string>;
  hasStylePool: boolean;
  hasTemplatePool: boolean;
  template: CliprHookTemplate;
}) {
  if (template.source !== "clipstitchr") {
    return !hasStylePool || eligibleStyleKeys.has(template.styleKey);
  }

  if (hasTemplatePool) {
    return eligibleTemplateIds.has(template.id);
  }

  if (hasStylePool) {
    return eligibleStyleKeys.has(template.styleKey);
  }

  return true;
}

function getIsEligibleTemplate(
  template: CliprHookTemplate,
  purpose: CliprTextPurpose,
) {
  const isAggressiveBlocked =
    template.riskLevel === "aggressive" && purpose === "clipr";

  return (
    template.active &&
    template.allowedPurposes.includes(purpose) &&
    !isAggressiveBlocked &&
    !getCliprTextHasForbiddenCta(template.template)
  );
}

export function getCliprEligibleHookTemplates(
  product: ProductProfile,
  purpose: CliprTextPurpose,
): CliprHookTemplate[] {
  const eligibleTemplateIds = new Set(product.eligibleCliprHookTemplateIds ?? []);
  const eligibleStyleKeys = new Set(product.eligibleCliprHookStyleKeys ?? []);
  const hasTemplatePool = eligibleTemplateIds.size > 0;
  const hasStylePool = eligibleStyleKeys.size > 0;
  const templates = cliprHookTemplates.filter((template) => {
    if (!getIsEligibleTemplate(template, purpose)) {
      return false;
    }

    return getTemplateMatchesProductPool({
      eligibleStyleKeys,
      eligibleTemplateIds,
      hasStylePool,
      hasTemplatePool,
      template,
    });
  });

  return templates.length
    ? templates
    : cliprHookTemplates.filter((template) =>
        getIsEligibleTemplate(template, purpose),
      );
}
