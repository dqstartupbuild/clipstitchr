import { describe, expect, it } from "vitest";
import { createCliDemoAgentPlannerPrompt } from "@/lib/clipstitchr/server/cli/demoAgentPlanner/createCliDemoAgentPlannerPrompt";

describe("createCliDemoAgentPlannerPrompt", () => {
  it("tells the planner not to repeat attempted screenshots", () => {
    const prompt = JSON.parse(
      createCliDemoAgentPlannerPrompt({
        appContext: {
          projectDirectory: "web",
          projectType: "web",
          routes: [
            {
              confidence: "low",
              name: "Show /dashboard/hooks",
              path: "/dashboard/hooks",
            },
          ],
          workflowHints: [
            {
              actions: ["Hooks to learn from", "Save Hook Lab"],
              buttons: ["Save Hook Lab"],
              inputs: ["Hooks to learn from", "Hooks to avoid"],
              routePath: "/dashboard/hooks",
              sourceFiles: ["app/_components/hooks/ProductHookMemoryFields.tsx"],
              summary: "Inputs: Hooks to learn from. Buttons: Save Hook Lab",
              title: "Hooks workflow",
            },
          ],
        },
        approvedTestValueKeys: [],
        approvedUploadFileKeys: [],
        attemptedActionKeys: ["screenshot:step-3"],
        guide: {
          goal: "Demonstrate running a batch Stitch in Stitchr.",
          productId: "product_123",
          productName: "ClipStitchr",
          steps: [
            {
              id: "step-1",
              label: "Open Stitchr",
            },
            {
              id: "step-2",
              label: "Run a batch Stitch",
            },
          ],
          title: "Batch Stitch demo",
        },
        observation: {
          buttons: [{ name: "Upload", role: "button" }],
          dialogs: [],
          headings: [{ name: "Dashboard", role: "heading" }],
          inputs: [],
          links: [],
          title: "Dashboard",
          url: "http://localhost:3000/dashboard",
        },
        step: {
          id: "step-3",
          label: "Review the dashboard",
        },
      }),
    );

    expect(prompt.attemptedActionKeys).toEqual(["screenshot:step-3"]);
    expect(prompt.guide.goal).toBe(
      "Demonstrate running a batch Stitch in Stitchr.",
    );
    expect(prompt.guide.productName).toBe("ClipStitchr");
    expect(prompt.instruction).toContain("overall demo goal");
    expect(prompt.appContext.workflowHints[0].inputs).toContain(
      "Hooks to learn from",
    );
    expect(prompt.workflowContextRules).toEqual(
      expect.arrayContaining([
        "Prefer exact labels from observation and appContext over generic controls such as Open, Menu, or Profile.",
      ]),
    );
    expect(prompt.missingRequirementRules).toEqual(
      expect.arrayContaining([
        "Use guide.goal as the user's requested demo direction.",
        "When returning stop for a missing requirement, explain the specific setup needed in plain language.",
      ]),
    );
    expect(prompt.attemptedActionKeyRules).toEqual(
      expect.arrayContaining([
        "Never return an action whose key already appears in attemptedActionKeys.",
        "A screenshot action key is screenshot:<stepId>.",
      ]),
    );
  });
});
