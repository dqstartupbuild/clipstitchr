import { cliprHookStyles } from "@/lib/clipstitchr/resources/clipr/cliprHookStyles";
import { rawAppHookTemplates } from "@/lib/clipstitchr/resources/clipr/rawAppHookTemplates";
import { rawCliprHookTemplates } from "@/lib/clipstitchr/resources/clipr/rawCliprHookTemplates";
import { rawIdentityChallengeHookTemplates } from "@/lib/clipstitchr/resources/clipr/rawIdentityChallengeHookTemplates";
import { rawEducationHookTemplates } from "@/lib/clipstitchr/resources/clipr/rawEducationHookTemplates";
import { rawPolarizingReactionHookTemplates } from "@/lib/clipstitchr/resources/clipr/rawPolarizingReactionHookTemplates";
import { rawUgcDiscoveryHookTemplates } from "@/lib/clipstitchr/resources/clipr/rawUgcDiscoveryHookTemplates";
import type { CliprHookTemplate } from "@/lib/clipstitchr/types/CliprHookTemplate";
import type { CliprTextPurpose } from "@/lib/clipstitchr/types/CliprTextPurpose";
import { getCliprTemplateRequiredVariables } from "@/lib/clipstitchr/utils/getCliprTemplateRequiredVariables";

const defaultAllowedPurposes: CliprTextPurpose[] = [
  "clipr",
  "stitchr",
  "swipr",
];

export const cliprHookTemplates: CliprHookTemplate[] = [
  ...rawCliprHookTemplates,
  ...rawEducationHookTemplates,
  ...rawAppHookTemplates,
  ...rawIdentityChallengeHookTemplates,
  ...rawPolarizingReactionHookTemplates,
  ...rawUgcDiscoveryHookTemplates,
].map((template) => {
  const style = cliprHookStyles.find(
    (item) => item.styleKey === template.styleKey,
  );

  return {
    allowedPurposes: template.allowedPurposes ?? defaultAllowedPurposes,
    id: template.templateId,
    styleKey: template.styleKey,
    template: template.template,
    requiredVariables: getCliprTemplateRequiredVariables(template.template),
    emotionalTrigger: style?.emotionalTrigger ?? "curiosity",
    bestFor: style?.bestFor ?? [],
    riskLevel: style?.riskLevel ?? "safe",
    source: template.source ?? "clipstitchr",
    active: true,
  };
});
