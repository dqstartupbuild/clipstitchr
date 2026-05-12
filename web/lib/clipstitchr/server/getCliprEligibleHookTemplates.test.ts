import { describe, expect, it } from "vitest";
import { getCliprEligibleHookTemplates } from "@/lib/clipstitchr/server/getCliprEligibleHookTemplates";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";

const product: ProductProfile = {
  id: "product_1",
  name: "LaunchKit",
  productDetails: "Helps founders organize product launch content.",
  audienceDetails: "Founders and solo marketers.",
  cliprPlaceholderFillers: {},
  createdAt: "2026-01-01T00:00:00.000Z",
  eligibleCliprHookStyleKeys: ["mystery_gap", "receipt_stack"],
  eligibleCliprHookTemplateIds: ["MG-001"],
  inferredPainPoints: ["launch content gets scattered"],
  inferredProblem: "launch content gets scattered across tools",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

describe("getCliprEligibleHookTemplates", () => {
  it("keeps direct app hooks out of Clipr generations", () => {
    const templates = getCliprEligibleHookTemplates(product, "clipr");

    expect(templates.some((template) => template.id === "MG-001")).toBe(true);
    expect(
      templates.some((template) => template.source === "app_hook_library"),
    ).toBe(false);
  });

  it("adds app hook library templates for Stitchr auto-text", () => {
    const templates = getCliprEligibleHookTemplates(product, "stitchr");

    expect(
      templates.some((template) => template.source === "app_hook_library"),
    ).toBe(true);
    expect(
      templates.every((template) => template.allowedPurposes.includes("stitchr")),
    ).toBe(true);
  });
});
