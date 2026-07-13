import { describe, expect, it } from "vitest";
import { createAppUgcBrief } from "@/lib/clipstitchr/tools/appUgcBriefBuilder/createAppUgcBrief";
import { defaultAppUgcBriefInput } from "@/lib/clipstitchr/tools/appUgcBriefBuilder/defaultAppUgcBriefInput";
import { formatAppUgcBriefText } from "@/lib/clipstitchr/tools/appUgcBriefBuilder/formatAppUgcBriefText";

describe("createAppUgcBrief", () => {
  it.each([
    ["lean", 8],
    ["standard", 12],
    ["batch-ready", 20],
  ] as const)("creates a bounded %s deliverable set", (deliverableSize, total) => {
    const result = createAppUgcBrief({
      ...defaultAppUgcBriefInput,
      deliverableSize,
    });

    expect(result.deliverables.totalClips).toBe(total);
    expect(
      result.shotList.reduce((sum, shot) => sum + shot.count, 0),
    ).toBe(total);
  });

  it("uses supplied proof without strengthening it", () => {
    const result = createAppUgcBrief({
      ...defaultAppUgcBriefInput,
      proofPoint: "A customer approved this exact quote",
    });

    expect(result.proofBoundary).toContain(
      "A customer approved this exact quote",
    );
    expect(result.proofBoundary).toContain("Do not add numbers");
  });

  it("adds a no-invented-proof guardrail when proof is empty", () => {
    const result = createAppUgcBrief({
      ...defaultAppUgcBriefInput,
      proofPoint: "   ",
    });

    expect(result.proofBoundary).toContain("No approved proof was supplied");
    expect(result.proofBoundary).toContain("Do not invent");
  });

  it("formats every handoff section as copyable plain text", () => {
    const text = formatAppUgcBriefText(
      createAppUgcBrief(defaultAppUgcBriefInput),
    );

    expect(text).toContain("UGC AD BRIEF");
    expect(text).toContain("HOOK DIRECTIONS");
    expect(text).toContain("PRODUCT-DEMO HANDOFF");
    expect(text).toContain("Total separate files: 12");
    expect(text).toContain("vertical 9:16");
    expect(text).not.toContain("undefined");
  });
});
