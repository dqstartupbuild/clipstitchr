import type { AppAdHookRewriterInput } from "@/lib/clipstitchr/tools/appAdHookRewriter/AppAdHookRewriterInput";
import { getAppAdHookRewriteSourceCore } from "@/lib/clipstitchr/tools/appAdHookRewriter/getAppAdHookRewriteSourceCore";
import { normalizePublicHookText } from "@/lib/clipstitchr/tools/publicHooks/normalizePublicHookText";

export function fillAppAdHookRewriteTemplate(
  template: string,
  input: AppAdHookRewriterInput,
) {
  const values: Record<string, string> = {
    app: input.appContext,
    audience: input.audience,
    outcome: input.desiredOutcome.replace(/[.!?]+$/g, ""),
    problem: input.problem.replace(/[.!?]+$/g, ""),
    source: getAppAdHookRewriteSourceCore(input.currentHook) || input.appContext,
  };

  return normalizePublicHookText(
    template.replace(/\{\{([a-z_]+)\}\}/gi, (_, key: string) => values[key] ?? ""),
  );
}
