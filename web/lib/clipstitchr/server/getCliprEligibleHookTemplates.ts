import { cliprHookTemplates } from "@/lib/clipstitchr/resources/clipr/cliprHookTemplates";
import type { CliprHookTemplate } from "@/lib/clipstitchr/types/CliprHookTemplate";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";
import { getCliprTextHasForbiddenCta } from "@/lib/clipstitchr/utils/getCliprTextHasForbiddenCta";

export function getCliprEligibleHookTemplates(
  product: ProductProfile,
): CliprHookTemplate[] {
  const eligibleTemplateIds = new Set(product.eligibleCliprHookTemplateIds ?? []);
  const eligibleStyleKeys = new Set(product.eligibleCliprHookStyleKeys ?? []);
  const hasTemplatePool = eligibleTemplateIds.size > 0;
  const hasStylePool = eligibleStyleKeys.size > 0;
  const templates = cliprHookTemplates.filter((template) => {
    if (!template.active || getCliprTextHasForbiddenCta(template.template)) {
      return false;
    }

    if (template.riskLevel === "aggressive") {
      return false;
    }

    if (hasTemplatePool) {
      return eligibleTemplateIds.has(template.id);
    }

    if (hasStylePool) {
      return eligibleStyleKeys.has(template.styleKey);
    }

    return true;
  });

  return templates.length
    ? templates
    : cliprHookTemplates.filter(
        (template) =>
          template.active &&
          template.riskLevel !== "aggressive" &&
          !getCliprTextHasForbiddenCta(template.template),
      );
}
