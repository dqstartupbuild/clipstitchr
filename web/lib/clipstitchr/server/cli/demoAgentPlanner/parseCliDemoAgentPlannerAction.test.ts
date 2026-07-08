import { describe, expect, it } from "vitest";
import { parseCliDemoAgentPlannerAction } from "@/lib/clipstitchr/server/cli/demoAgentPlanner/parseCliDemoAgentPlannerAction";

describe("parseCliDemoAgentPlannerAction", () => {
  it("parses direct safe type text", () => {
    const action = parseCliDemoAgentPlannerAction(
      JSON.stringify({
        target: { label: "Hooks to learn from" },
        type: "type",
        valueText: "This app made demo creation finally feel simple.",
      }),
    );

    expect(action).toEqual(
      expect.objectContaining({
        target: { label: "Hooks to learn from" },
        type: "type",
        valueText: "This app made demo creation finally feel simple.",
      }),
    );
  });

  it("parses input click roles used by browser accessibility trees", () => {
    const action = parseCliDemoAgentPlannerAction(
      JSON.stringify({
        target: { name: "Demo product", role: "combobox" },
        type: "click",
      }),
    );

    expect(action).toEqual(
      expect.objectContaining({
        target: { name: "Demo product", role: "combobox" },
        type: "click",
      }),
    );
  });

  it("treats generic input role text as a label-based click", () => {
    const action = parseCliDemoAgentPlannerAction(
      JSON.stringify({
        target: { label: "Hooks to learn from", role: "input" },
        type: "click",
      }),
    );

    expect(action).toEqual(
      expect.objectContaining({
        target: { label: "Hooks to learn from", role: undefined },
        type: "click",
      }),
    );
  });

  it("parses scroll actions", () => {
    expect(
      parseCliDemoAgentPlannerAction(
        JSON.stringify({
          direction: "down",
          reason: "The picker is below the current viewport.",
          stepId: "step-3",
          type: "scroll",
        }),
      ),
    ).toEqual({
      direction: "down",
      reason: "The picker is below the current viewport.",
      stepId: "step-3",
      type: "scroll",
    });
  });

  it("parses the expanded browser action set", () => {
    const inputs = [
      { target: { label: "Format" }, optionLabel: "Short", type: "selectOption" },
      { key: "Enter", target: { label: "Search" }, type: "pressKey" },
      { target: { label: "Search" }, type: "clearField" },
      { text: "Results", type: "scrollToText" },
      { target: { name: "Save", role: "button" }, type: "scrollToControl" },
      { target: { name: "Save", role: "button" }, type: "clickFirstMatching" },
      { actionName: "Use", cardText: "Demo clip", type: "clickCardAction" },
      { statusText: "Generating", timeoutMs: 20000, type: "waitForJob" },
      {
        target: { name: "Generate", role: "button" },
        type: "waitForElementEnabled",
      },
      { mediaType: "ugc", searchText: "latest clip", type: "chooseFileFromLibrary" },
      { checked: true, target: { label: "Loop clip" }, type: "toggle" },
      { mode: "Normal", type: "setMode" },
      { target: { name: "More", role: "button" }, type: "openMenu" },
      { name: "Rename", type: "chooseMenuItem" },
      { type: "closeDialog" },
      { sourceText: "Clip A", targetText: "Drop here", type: "dragAndDrop" },
      { target: { label: "Volume" }, type: "setSlider", value: 35 },
      { mediaAction: "play", targetLabel: "Preview", type: "playPauseMedia" },
      { seconds: 8, targetLabel: "Preview", type: "seekMedia" },
      { target: { name: "Download", role: "button" }, type: "downloadFile" },
      { target: { name: "Copy", role: "button" }, type: "copyToClipboard" },
    ];

    expect(
      inputs.map((input) =>
        parseCliDemoAgentPlannerAction(JSON.stringify(input)),
      ),
    ).toEqual(
      inputs.map((input) =>
        expect.objectContaining({
          type: input.type,
        }),
      ),
    );
  });

  it("rejects type actions without a value key or text", () => {
    expect(() =>
      parseCliDemoAgentPlannerAction(
        JSON.stringify({
          target: { label: "Hooks to learn from" },
          type: "type",
        }),
      ),
    ).toThrow(/value key or text/);
  });
});
