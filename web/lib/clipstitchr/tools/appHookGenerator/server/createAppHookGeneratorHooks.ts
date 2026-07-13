import type { AppHookGeneratorHook } from "@/lib/clipstitchr/tools/appHookGenerator/AppHookGeneratorHook";
import type { AppHookGeneratorRequest } from "@/lib/clipstitchr/tools/appHookGenerator/AppHookGeneratorRequest";
import { fillAppHookGeneratorTemplate } from "@/lib/clipstitchr/tools/appHookGenerator/server/fillAppHookGeneratorTemplate";
import { getAppHookGeneratorAngle } from "@/lib/clipstitchr/tools/appHookGenerator/server/getAppHookGeneratorAngle";
import { getAppHookGeneratorReason } from "@/lib/clipstitchr/tools/appHookGenerator/server/getAppHookGeneratorReason";
import { selectAppHookGeneratorTemplates } from "@/lib/clipstitchr/tools/appHookGenerator/server/selectAppHookGeneratorTemplates";

export function createAppHookGeneratorHooks(
  input: AppHookGeneratorRequest,
): AppHookGeneratorHook[] {
  const hooks = selectAppHookGeneratorTemplates(input).map(({ style, template }) => ({
    angle: getAppHookGeneratorAngle(style),
    reason: getAppHookGeneratorReason(style),
    text: fillAppHookGeneratorTemplate(template, input),
  }));
  const seen = new Set<string>();
  const distinctHooks = hooks.filter((hook) => {
    const key = hook.text.toLowerCase();

    if (!hook.text || /{{|}}/.test(hook.text) || seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });

  if (distinctHooks.length !== 8) {
    throw new Error("App Hook Generator could not build a complete set.");
  }

  return distinctHooks;
}
