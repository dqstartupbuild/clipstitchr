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
