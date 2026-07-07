import { describe, expect, it } from "vitest";
import { createCliDemoGuidePrompt } from "@/lib/clipstitchr/server/cli/demoGuides/createCliDemoGuidePrompt";
import type { CliDemoGuideGenerateRequest } from "@/lib/clipstitchr/server/cli/demoGuides/CliDemoGuideGenerateRequest";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";

function createProduct(overrides: Partial<ProductProfile> = {}): ProductProfile {
  return {
    audienceDetails: "Busy founders who record product demos.",
    createdAt: "2026-07-06T00:00:00.000Z",
    id: "product_123",
    inferredPainPoints: ["Recording demos takes too long."],
    inferredProblem: "Demo content is slow to make.",
    name: "ClipStitchr",
    productDetails: "A tool for turning product recordings into short videos.",
    updatedAt: "2026-07-06T00:00:00.000Z",
    websiteUrl: "https://clipstitchr.test",
    ...overrides,
  };
}

function createRequest(
  overrides: Partial<CliDemoGuideGenerateRequest> = {},
): CliDemoGuideGenerateRequest {
  return {
    appType: "web",
    flowName: "Dashboard",
    flowPath: "/dashboard",
    goal: "Show the upload flow",
    productId: "product_123",
    stepCount: 5,
    targetAudience: "busy founders recording product demos",
    ...overrides,
  };
}

describe("createCliDemoGuidePrompt", () => {
  it.each([
    {
      name: "web",
      request: createRequest(),
    },
    {
      name: "mobile",
      request: createRequest({
        appType: "ios",
        flowName: "Mobile onboarding",
        flowPath: undefined,
      }),
    },
    {
      name: "auth-required",
      request: createRequest({
        goal: "Show sign in and the main workspace",
      }),
    },
    {
      name: "loading-process",
      request: createRequest({
        goal: "Show upload processing and review the finished result",
      }),
    },
    {
      name: "minimal-product",
      product: createProduct({
        audienceDetails: "",
        inferredPainPoints: [],
        inferredProblem: undefined,
        productDetails: "",
        websiteUrl: undefined,
      }),
      request: createRequest({
        flowName: undefined,
        flowPath: undefined,
        targetAudience: "people evaluating this product",
      }),
    },
  ])("matches the $name prompt shape", ({ product, request }) => {
    expect(
      JSON.parse(createCliDemoGuidePrompt({ product: product ?? createProduct(), request })),
    ).toMatchSnapshot();
  });
});
