import { describe, expect, it } from "vitest";
import { buildAppHookTestingMatrix } from "@/lib/clipstitchr/tools/appHookTestingMatrix/buildAppHookTestingMatrix";
import { defaultAppHookTestingMatrixInput } from "@/lib/clipstitchr/tools/appHookTestingMatrix/defaultAppHookTestingMatrixInput";
import { formatAppHookTestingMatrixMarkdown } from "@/lib/clipstitchr/tools/appHookTestingMatrix/formatAppHookTestingMatrixMarkdown";

describe("buildAppHookTestingMatrix", () => {
  it("creates a control, hook-only challengers, and visual-only follow-ups", () => {
    const result = buildAppHookTestingMatrix(defaultAppHookTestingMatrixInput);

    expect(result.cells).toHaveLength(4);
    expect(result.cells[0]?.changedVariable).toBe(
      "Control baseline — nothing changes",
    );
    expect(
      result.cells
        .filter((cell) => cell.stage === "Hook test")
        .every((cell) => cell.changedVariable === "Hook only"),
    ).toBe(true);
    expect(
      result.cells
        .filter((cell) => cell.stage === "Visual follow-up")
        .every((cell) => cell.changedVariable === "Visual only"),
    ).toBe(true);
    expect(new Set(result.cells.map((cell) => cell.cta))).toEqual(
      new Set([defaultAppHookTestingMatrixInput.stableCta]),
    );
  });

  it("caps inputs at five hooks and three visuals and names every variable", () => {
    const result = buildAppHookTestingMatrix({
      ...defaultAppHookTestingMatrixInput,
      hooks: Array.from({ length: 9 }, (_, index) => `Hook ${index + 1}`),
      visuals: Array.from({ length: 6 }, (_, index) => `Visual ${index + 1}`),
    });
    const markdown = formatAppHookTestingMatrixMarkdown(result);

    expect(result.cells).toHaveLength(7);
    expect(result.cells.every((cell) => cell.changedVariable.length > 0)).toBe(
      true,
    );
    expect(markdown.match(/Changed variable:/g)).toHaveLength(7);
  });
});
