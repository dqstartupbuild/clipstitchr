import type { AppAdHookRewrite } from "@/lib/clipstitchr/tools/appAdHookRewriter/AppAdHookRewrite";
import type { AppAdHookRewriterInput } from "@/lib/clipstitchr/tools/appAdHookRewriter/AppAdHookRewriterInput";
import { appAdHookRewriteFallbackTemplates } from "@/lib/clipstitchr/tools/appAdHookRewriter/appAdHookRewriteFallbackTemplates";
import { appAdHookRewritePatterns } from "@/lib/clipstitchr/tools/appAdHookRewriter/appAdHookRewritePatterns";
import { fillAppAdHookRewriteTemplate } from "@/lib/clipstitchr/tools/appAdHookRewriter/fillAppAdHookRewriteTemplate";
import { getAppAdHookRewriteCandidateIsSafe } from "@/lib/clipstitchr/tools/appAdHookRewriter/getAppAdHookRewriteCandidateIsSafe";

export function createAppAdHookRewrites(input: AppAdHookRewriterInput) {
  const seen = new Set<string>();
  let fallbackIndex = 0;

  return appAdHookRewritePatterns.map((pattern) => {
    const candidates = [
      pattern.template,
      ...appAdHookRewriteFallbackTemplates.slice(fallbackIndex),
      ...appAdHookRewriteFallbackTemplates.slice(0, fallbackIndex),
    ].map((template) => fillAppAdHookRewriteTemplate(template, input));
    const candidate = candidates.find((text) =>
      getAppAdHookRewriteCandidateIsSafe({ candidate: text, input, seen }),
    );

    if (!candidate) {
      throw new Error("Unable to build six safe, distinct hook rewrites.");
    }

    seen.add(candidate.toLowerCase());
    fallbackIndex =
      (fallbackIndex + 1) % appAdHookRewriteFallbackTemplates.length;

    return {
      direction: pattern.direction,
      label: pattern.label,
      note: pattern.note,
      text: candidate,
    } satisfies AppAdHookRewrite;
  });
}
