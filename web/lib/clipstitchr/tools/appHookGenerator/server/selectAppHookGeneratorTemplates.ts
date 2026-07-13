import { cliprHookStyles } from "@/lib/clipstitchr/resources/clipr/cliprHookStyles";
import { rawAppHookTemplates } from "@/lib/clipstitchr/resources/clipr/rawAppHookTemplates";
import type { AppHookGeneratorRequest } from "@/lib/clipstitchr/tools/appHookGenerator/AppHookGeneratorRequest";
import type { AppHookGeneratorTemplate } from "@/lib/clipstitchr/tools/appHookGenerator/server/AppHookGeneratorTemplate";
import { selectAppHookGeneratorTemplateIds } from "@/lib/clipstitchr/tools/appHookGenerator/server/selectAppHookGeneratorTemplateIds";

export function selectAppHookGeneratorTemplates(
  input: AppHookGeneratorRequest,
): AppHookGeneratorTemplate[] {
  const selectedIds = selectAppHookGeneratorTemplateIds(input);
  const templateById = new Map(
    rawAppHookTemplates.map((template) => [template.templateId, template]),
  );
  const styleByKey = new Map(
    cliprHookStyles.map((style) => [style.styleKey, style]),
  );

  return selectedIds.map((templateId) => {
    const template = templateById.get(templateId);
    const style = template ? styleByKey.get(template.styleKey) : undefined;

    if (!template || !style) {
      throw new Error("App Hook Generator catalog is incomplete.");
    }

    return { style, template };
  });
}
