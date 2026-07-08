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
          canScrollDown: true,
          canScrollUp: false,
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
        "Type, clearField, selectOption, toggle, and setSlider labels must match a visible observation.inputs label or name.",
        "Prefer semantic actions when they directly match the UI task: selectCard for card selection, selectOption for selects, toggle for switches, setMode for modes, openMenu and chooseMenuItem for menus, downloadFile for downloads, copyToClipboard for copy buttons, and waitForJob for generation or processing.",
        "If step.label is Open followed by a local path like /dashboard/tool, return a navigate action to that exact path unless observation.url is already on that path.",
        "If the step names a field, picker, section, or button that is not in observation but observation.canScrollDown is true, return one scroll down action before stopping or guessing.",
        "For steps that say Type X into FIELD, return one type action with target.label set to FIELD and valueText set to X. Do not split focusing the field from typing the value.",
        "If the goal or step names a mode, choose that visible mode before using mode-specific inputs, pickers, or create buttons.",
        "For card, tile, row, media, file, or picker selection, use visible search or filter inputs when helpful, scroll to the relevant item, then use selectCard with stable visible card text and checked true when the item exposes a selectable checkbox.",
        "Use clickCardAction only when the card contains a separately named visible action button.",
        "Before interacting with a lower main workflow section, card, row, tile, or picker, use scrollToText, scrollToControl, or scroll so the relevant area is visible in the recording.",
        "When a workflow has paired positive and negative inputs, such as learn from and avoid, include and exclude, use and block, choose the input whose label matches the user's wording.",
        "Prefer exact labels from observation and appContext over generic controls such as Open, Menu, or Profile.",
      ]),
    );
    expect(prompt.allowedActionShape.type).toContain("valueText");
    expect(prompt.allowedActionShape.chooseFileFromLibrary).toContain("video");
    expect(prompt.allowedActionShape.selectCard).toContain("cardText");
    expect(prompt.allowedActionShape.selectOption).toContain("optionLabel");
    expect(prompt.allowedActionShape.downloadFile).toContain("Download");
    expect(prompt.allowedActionShape.copyToClipboard).toContain("Copy");
    expect(prompt.allowedActionShape.dragAndDrop).toContain("sourceText");
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
        "A selectCard action key is selectCard:<cardText>:<checked>.",
      ]),
    );
  });
});
