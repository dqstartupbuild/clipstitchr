import { cliprHookTemplates } from "@/lib/clipstitchr/resources/clipr/cliprHookTemplates";
import type { CliprHookTemplate } from "@/lib/clipstitchr/types/CliprHookTemplate";
import type { CliprTextPurpose } from "@/lib/clipstitchr/types/CliprTextPurpose";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";
import { getStitchrExclusiveHookTemplates } from "@/lib/clipstitchr/server/getStitchrExclusiveHookTemplates";
import { getCliprTextHasForbiddenCta } from "@/lib/clipstitchr/utils/getCliprTextHasForbiddenCta";

function getUniqueHookTemplates(templates: CliprHookTemplate[]) {
  const seenIds = new Set<string>();

  return templates.filter((template) => {
    if (seenIds.has(template.id)) {
      return false;
    }

    seenIds.add(template.id);
    return true;
  });
}

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
  return (
    template.active &&
    template.allowedPurposes.includes(purpose) &&
    !getCliprTextHasForbiddenCta(template.template)
  );
}

export function getCliprEligibleHookTemplates(
  product: ProductProfile,
  purpose: CliprTextPurpose,
): CliprHookTemplate[] {
  const eligibleTemplateIds = new Set(
    product.eligibleCliprHookTemplateIds ?? [],
  );
  const eligibleStyleKeys = new Set(product.eligibleCliprHookStyleKeys ?? []);
  const hasTemplatePool = eligibleTemplateIds.size > 0;
  const hasStylePool = eligibleStyleKeys.size > 0;
  const preferredStyleKey = product.preferredCliprHookStyleKey?.trim();
  const stitchrExclusiveTemplates = getStitchrExclusiveHookTemplates({
    purpose,
    templates: cliprHookTemplates,
  }).filter((template) => !getCliprTextHasForbiddenCta(template.template));
  const preferredTemplates = preferredStyleKey
    ? cliprHookTemplates.filter(
        (template) =>
          getIsEligibleTemplate(template, purpose) &&
          template.styleKey === preferredStyleKey,
      )
    : [];

  if (preferredTemplates.length) {
    return getUniqueHookTemplates([
      ...stitchrExclusiveTemplates,
      ...preferredTemplates,
    ]);
  }

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

  const purposeTemplates = getUniqueHookTemplates([
    ...stitchrExclusiveTemplates,
    ...templates,
  ]);

  return purposeTemplates.length
    ? purposeTemplates
    : cliprHookTemplates.filter((template) =>
        getIsEligibleTemplate(template, purpose),
      );
}
