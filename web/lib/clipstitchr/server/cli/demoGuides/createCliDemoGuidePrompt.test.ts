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
    appContext: {
      projectDirectory: "web",
      projectType: "web",
      routes: [
        { confidence: "low", name: "Show /dashboard/hooks", path: "/dashboard/hooks" },
      ],
      workflowHints: [
        {
          actions: ["Hooks to learn from", "Save Hook Lab", "Accept hook"],
          buttons: ["Save Hook Lab", "Accept hook"],
          featureLabels: ["Hook Lab"],
          inputs: ["Hooks to learn from", "Hooks to avoid", "Main goal", "Tone"],
          routePath: "/dashboard/hooks",
          sourceFiles: ["app/_components/hooks/ProductHookMemoryFields.tsx"],
          summary:
            "Inputs: Hooks to learn from, Hooks to avoid. Buttons: Save Hook Lab, Accept hook",
          title: "Hooks workflow",
        },
      ],
    },
    availableFlows: [
      { confidence: "medium", name: "Open the product", path: "/" },
      { confidence: "medium", name: "Show the main workspace", path: "/dashboard" },
      { confidence: "low", name: "Show /dashboard/library", path: "/dashboard/library" },
      { confidence: "low", name: "Show /dashboard/stitchr", path: "/dashboard/stitchr" },
    ],
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

  it("tells the model to avoid presenter-only steps", () => {
    const prompt = JSON.parse(
      createCliDemoGuidePrompt({
        product: createProduct(),
        request: createRequest(),
      }),
    );

    expect(prompt.agentCapabilities.cannot).toContain("point at the screen");
    expect(prompt.rules.bannedStepVerbs).toContain("Highlight");
    expect(prompt.rules.primaryGoal).toContain("demo.goal");
    expect(prompt.rules.routeChoice).toContain("matching route");
    expect(prompt.rules.missingSetup).toContain("existing media");
    expect(prompt.rules.useAppContext).toContain("feature labels");
    expect(prompt.rules.addCreateSemantics).toContain("typing into matching inputs");
    expect(prompt.rules.hookLabSemantics).toContain("Hooks to learn from");
    expect(prompt.demo.appContext.workflowHints[0].inputs).toContain(
      "Hooks to learn from",
    );
    expect(prompt.demo.appContext.workflowHints[0].featureLabels).toContain(
      "Hook Lab",
    );
    expect(prompt.demo.availableFlows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: "/dashboard" }),
      ]),
    );
  });
});
