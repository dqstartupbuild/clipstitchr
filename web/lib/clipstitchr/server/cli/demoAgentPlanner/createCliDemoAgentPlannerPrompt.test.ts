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
              featureLabels: ["Hook Lab"],
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
        "Map abstract user wording through appContext featureLabels, actions, inputs, and buttons before choosing a route or field.",
        "Click target names must come from observation.buttons or observation.links exactly; appContext cannot supply a click target unless the same label is currently visible.",
        "Type target labels must match a visible observation.inputs label or name.",
        "If step.label is Open followed by a local path like /dashboard/stitchr, return a navigate action to that exact path unless observation.url is already on that path.",
        "For steps that say Type X into FIELD, return one type action with target.label set to FIELD and valueText set to X. Do not split focusing the field from typing the value.",
        "For Hook Lab requests to add new hooks or hooks to learn from, type safe examples into the visible Hooks to learn from input, then click a visible Save Hook Lab button.",
        "Prefer exact labels from observation and appContext over generic controls such as Open, Menu, or Profile.",
      ]),
    );
    expect(prompt.allowedActionShape.type).toContain("valueText");
    expect(prompt.typingRules).toEqual(
      expect.arrayContaining([
        "Typing is allowed for safe demo text in local app fields.",
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
