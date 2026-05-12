import { cliprHookStyles } from "@/lib/clipstitchr/resources/clipr/cliprHookStyles";
import { rawCliprHookTemplates } from "@/lib/clipstitchr/resources/clipr/rawCliprHookTemplates";
import type { CliprHookTemplate } from "@/lib/clipstitchr/types/CliprHookTemplate";
import { getCliprTemplateRequiredVariables } from "@/lib/clipstitchr/utils/getCliprTemplateRequiredVariables";

export const cliprHookTemplates: CliprHookTemplate[] =
  rawCliprHookTemplates.map((template) => {
    const style = cliprHookStyles.find(
      (item) => item.styleKey === template.styleKey,
    );

    return {
      id: template.templateId,
      styleKey: template.styleKey,
      template: template.template,
      requiredVariables: getCliprTemplateRequiredVariables(template.template),
      emotionalTrigger: style?.emotionalTrigger ?? "curiosity",
      bestFor: style?.bestFor ?? [],
      riskLevel: style?.riskLevel ?? "safe",
      active: true,
    };
  });
