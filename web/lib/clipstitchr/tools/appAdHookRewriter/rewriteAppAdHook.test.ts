import { describe, expect, it } from "vitest";
import { defaultAppAdHookRewriterInput } from "@/lib/clipstitchr/tools/appAdHookRewriter/defaultAppAdHookRewriterInput";
import { rewriteAppAdHook } from "@/lib/clipstitchr/tools/appAdHookRewriter/rewriteAppAdHook";
import { getPublicHookTextSimilarity } from "@/lib/clipstitchr/tools/publicHooks/getPublicHookTextSimilarity";

describe("rewriteAppAdHook", () => {
  it("returns six labeled, distinct, bounded rewrites", () => {
    const result = rewriteAppAdHook(defaultAppAdHookRewriterInput);
    const texts = result.rewrites.map((rewrite) => rewrite.text.toLowerCase());

    expect(result.rewrites).toHaveLength(6);
    expect(new Set(texts).size).toBe(6);
    expect(result.rewrites.map((rewrite) => rewrite.label)).toEqual([
      "Clearer",
      "Shorter",
      "Audience-first",
      "Problem-first",
      "Outcome-led",
      "Pattern break",
    ]);
    expect(result.rewrites.every((rewrite) => rewrite.text.length <= 140)).toBe(
      true,
    );
    expect(result.rewrites.every((rewrite) => !/{{|}}/.test(rewrite.text))).toBe(
      true,
    );
  });

  it("keeps rewrites materially different from the source", () => {
    const result = rewriteAppAdHook(defaultAppAdHookRewriterInput);

    expect(
      result.rewrites.every(
        (rewrite) =>
          getPublicHookTextSimilarity(
            defaultAppAdHookRewriterInput.currentHook,
            rewrite.text,
          ) < 0.82,
      ),
    ).toBe(true);
  });

  it("preserves a safe, useful core from the submitted hook", () => {
    const result = rewriteAppAdHook(defaultAppAdHookRewriterInput);

    expect(
      result.rewrites.every((rewrite) =>
        rewrite.text.toLowerCase().includes("meal planning app"),
      ),
    ).toBe(true);
    expect(result.rewrites.map((rewrite) => rewrite.text).join(" ")).not.toMatch(
      /total game changer/i,
    );
  });

  it("flags risky context without copying its promises into rewrites", () => {
    const result = rewriteAppAdHook({
      ...defaultAppAdHookRewriterInput,
      currentHook: "Doctors guarantee 100% investment returns instantly",
      desiredOutcome: "guaranteed investment returns",
      problem: "losing 20% every month",
    });
    const outputText = result.rewrites.map((rewrite) => rewrite.text).join(" ");

    expect(result.claimSignals.length).toBeGreaterThan(0);
    expect(outputText).not.toMatch(/100%|20%|guarantee|investment returns|doctors/i);
  });

  it("avoids context-dependent wording when no first visual is planned", () => {
    const result = rewriteAppAdHook({
      ...defaultAppAdHookRewriterInput,
      firstVisual: "",
    });

    expect(result.rewrites.map((rewrite) => rewrite.text).join(" ")).not.toMatch(
      /\b(?:that|this)\b/i,
    );
  });
});
