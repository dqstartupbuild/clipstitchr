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
      templates.every((template) =>
        template.allowedPurposes.includes("stitchr"),
      ),
    ).toBe(true);
  });

  it("adds polarizing reaction templates for Stitchr auto-text", () => {
    const templates = getCliprEligibleHookTemplates(product, "stitchr");

    expect(
      templates.some(
        (template) => template.source === "polarizing_reaction_patterns",
      ),
    ).toBe(true);
  });

  it("adds all UGC discovery patterns only for Stitchr auto-text", () => {
    const stitchrTemplates = getCliprEligibleHookTemplates(product, "stitchr");
    const cliprTemplates = getCliprEligibleHookTemplates(product, "clipr");
    const swiprTemplates = getCliprEligibleHookTemplates(product, "swipr");

    expect(
      stitchrTemplates.filter(
        (template) => template.source === "ugc_discovery_patterns",
      ),
    ).toHaveLength(300);
    expect(
      cliprTemplates.some(
        (template) => template.source === "ugc_discovery_patterns",
      ),
    ).toBe(false);
    expect(
      swiprTemplates.some(
        (template) => template.source === "ugc_discovery_patterns",
      ),
    ).toBe(false);
  });

  it("keeps polarizing reaction templates out of Clipr generations", () => {
    const templates = getCliprEligibleHookTemplates(product, "clipr");

    expect(
      templates.some(
        (template) => template.source === "polarizing_reaction_patterns",
      ),
    ).toBe(false);
  });

  it("allows aggressive templates for Clipr and Stitchr", () => {
    const broadProduct = {
      ...product,
      eligibleCliprHookStyleKeys: undefined,
      eligibleCliprHookTemplateIds: undefined,
    };

    const cliprTemplates = getCliprEligibleHookTemplates(broadProduct, "clipr");
    const stitchrTemplates = getCliprEligibleHookTemplates(
      broadProduct,
      "stitchr",
    );

    expect(
      cliprTemplates.some(
        (template) => template.styleKey === "identity_challenge",
      ),
    ).toBe(true);
    expect(
      stitchrTemplates.some(
        (template) => template.styleKey === "identity_challenge",
      ),
    ).toBe(true);
    expect(
      stitchrTemplates.some((template) => template.riskLevel === "aggressive"),
    ).toBe(true);
  });

  it("prefers a saved hook style over the inferred product pool", () => {
    const templates = getCliprEligibleHookTemplates(
      {
        ...product,
        preferredCliprHookStyleKey: "identity_challenge",
      },
      "clipr",
    );

    expect(templates.length).toBeGreaterThan(0);
    expect(
      templates.every((template) => template.styleKey === "identity_challenge"),
    ).toBe(true);
  });
});
