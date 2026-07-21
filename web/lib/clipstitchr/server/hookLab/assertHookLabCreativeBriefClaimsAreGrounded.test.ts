import { describe, expect, it } from "vitest";
import { assertHookLabCreativeBriefClaimsAreGrounded } from "./assertHookLabCreativeBriefClaimsAreGrounded";

const brief = {
  beatScript: ["Show the current task", "Show the saved workflow"],
  callToAction: "See the workflow.",
  directionName: "Morning reset",
  footageNeeds: ["A task list"],
  hook: "This task keeps interrupting your morning.",
  openingVisual: "Coffee beside a task list.",
  productProof: "Record the workflow doing the supported task.",
  soundOffOverlay: "The task behind the delay",
};
const product = {
  audienceDetails: "Busy founders",
  createdAt: "2026-07-21T00:00:00.000Z",
  id: "product_1",
  inferredPainPoints: ["Manual campaign work"],
  name: "Launch Kit",
  productDetails: "A saved launch workflow",
  updatedAt: "2026-07-21T00:00:00.000Z",
};

describe("assertHookLabCreativeBriefClaimsAreGrounded", () => {
  it("accepts a brief without unsupported claim signals", () => {
    expect(() =>
      assertHookLabCreativeBriefClaimsAreGrounded({ brief, product }),
    ).not.toThrow();
  });

  it("rejects a measurable result absent from the saved product", () => {
    expect(() =>
      assertHookLabCreativeBriefClaimsAreGrounded({
        brief: { ...brief, productProof: "Show the workflow saving 3 hours." },
        product,
      }),
    ).toThrow("unsupported product claim");
  });

  it("rejects a different number when the product supports another number", () => {
    expect(() =>
      assertHookLabCreativeBriefClaimsAreGrounded({
        brief: { ...brief, productProof: "Show the workflow saving 3 hours." },
        product: { ...product, productDetails: "A workflow that saves 2 hours" },
      }),
    ).toThrow("exact support");
  });
});
