import { describe, expect, it } from "vitest";
import { buildAppAdCreativeTestingBlueprint } from "@/lib/clipstitchr/tools/appAdCreativeTestingBlueprint/buildAppAdCreativeTestingBlueprint";
import { defaultAppAdCreativeTestingBlueprintInput } from "@/lib/clipstitchr/tools/appAdCreativeTestingBlueprint/defaultAppAdCreativeTestingBlueprintInput";
import { formatAppAdCreativeTestingBlueprintMarkdown } from "@/lib/clipstitchr/tools/appAdCreativeTestingBlueprint/formatAppAdCreativeTestingBlueprintMarkdown";

function getCompleteResult(input = defaultAppAdCreativeTestingBlueprintInput) {
  const build = buildAppAdCreativeTestingBlueprint(input);
  expect(build.status).toBe("complete");

  if (build.status !== "complete") {
    throw new Error("Expected a complete blueprint.");
  }

  return build.result;
}

describe("buildAppAdCreativeTestingBlueprint", () => {
  it("builds three distinct hypothesis lanes and nine one-variable cells", () => {
    const result = getCompleteResult();

    expect(result.lanes.map((lane) => lane.key)).toEqual([
      "audience-message",
      "hook",
      "proof-objection",
    ]);
    expect(new Set(result.lanes.map((lane) => lane.key)).size).toBe(3);
    expect(result.cells).toHaveLength(9);
    expect(
      result.cells.every(
        (cell) =>
          cell.changedVariable.length > 0 && cell.fixedControls.length === 3,
      ),
    ).toBe(true);
  });

  it("changes lane priority by campaign stage without changing the objective set", () => {
    const newCampaign = getCompleteResult();
    const learning = getCompleteResult({
      ...defaultAppAdCreativeTestingBlueprintInput,
      campaignStage: "learning",
    });

    expect(learning.lanes.map((lane) => lane.key)).not.toEqual(
      newCampaign.lanes.map((lane) => lane.key),
    );
    expect(new Set(learning.lanes.map((lane) => lane.key))).toEqual(
      new Set(newCampaign.lanes.map((lane) => lane.key)),
    );
  });

  it("selects materially different lanes for every testing objective", () => {
    const laneSets = [
      "winning-message",
      "opening",
      "product-proof",
      "conversion-intent",
      "creative-refresh",
    ].map((objective) =>
      getCompleteResult({
        ...defaultAppAdCreativeTestingBlueprintInput,
        objective:
          objective as typeof defaultAppAdCreativeTestingBlueprintInput.objective,
      })
        .lanes.map((lane) => lane.key)
        .join("|"),
    );

    expect(new Set(laneSets).size).toBe(5);
  });

  it("uses the lower of production capacity and the visitor's funded capacity", () => {
    const result = getCompleteResult({
      ...defaultAppAdCreativeTestingBlueprintInput,
      weeklyProductionCapacity: 8,
      weeklyBudget: 500,
      minimumSpendPerVariant: 125,
    });

    expect(result.fundedCellCapacity).toBe(4);
    expect(result.activeCellCount).toBe(4);
    expect(result.backlogCellCount).toBe(5);
    expect(
      result.cells
        .filter((cell) => cell.status === "active")
        .map((cell) => cell.id),
    ).toEqual([
      "audience-message-control",
      "audience-message-challenger-a",
      "hook-control",
      "hook-challenger-a",
    ]);
  });

  it("does not invent funded capacity when the visitor omits a spend floor", () => {
    const result = getCompleteResult({
      ...defaultAppAdCreativeTestingBlueprintInput,
      weeklyProductionCapacity: 7,
      weeklyBudget: 500,
      minimumSpendPerVariant: null,
    });

    expect(result.fundedCellCapacity).toBeNull();
    expect(result.activeCellCount).toBe(7);
    expect(result.measurementContract.insufficientEvidenceMessage).toContain(
      "Set a fair evidence floor",
    );
  });

  it("uses approved-proof availability honestly and never invents evidence", () => {
    const result = getCompleteResult({
      ...defaultAppAdCreativeTestingBlueprintInput,
      objective: "product-proof",
      approvedProof: "",
      proofAssets: 5,
      weeklyProductionCapacity: 6,
    });
    const proofGap = result.assetGaps.find((gap) => gap.key === "proofAssets");
    const markdown = formatAppAdCreativeTestingBlueprintMarkdown(result);

    expect(proofGap?.available).toBe(0);
    expect(proofGap?.gap).toBeGreaterThan(0);
    expect(proofGap?.guidance).toContain("Capture or verify proof");
    expect(markdown).toContain("Do not strengthen an unsupported claim");
  });

  it("returns a clear incomplete state when required context is blank", () => {
    const build = buildAppAdCreativeTestingBlueprint({
      ...defaultAppAdCreativeTestingBlueprintInput,
      appName: " ",
      primaryMetric: "",
    });

    expect(build).toEqual({
      status: "incomplete",
      missingFields: ["App name", "Primary metric"],
    });
  });

  it("normalizes unsafe numbers without NaN, Infinity, or undefined output", () => {
    const result = getCompleteResult({
      ...defaultAppAdCreativeTestingBlueprintInput,
      weeklyProductionCapacity: Number.POSITIVE_INFINITY,
      ugcOpenings: Number.NaN,
      demos: -4,
      baseline: Number.POSITIVE_INFINITY,
      target: -10,
      weeklyBudget: Number.NaN,
      minimumSpendPerVariant: 0,
      minimumConversionEvents: 3.9,
    });
    const markdown = formatAppAdCreativeTestingBlueprintMarkdown(result);

    expect(result.activeCellCount).toBe(0);
    expect(result.measurementContract.baseline).toBeNull();
    expect(result.measurementContract.target).toBe(0);
    expect(result.measurementContract.minimumConversionEvents).toBe(3);
    expect(markdown).not.toContain("NaN");
    expect(markdown).not.toContain("Infinity");
    expect(markdown).not.toContain("undefined");
  });

  it("creates deterministic copy with every lane, cell, gap, and decision", () => {
    const first = getCompleteResult();
    const second = getCompleteResult();
    const markdown = formatAppAdCreativeTestingBlueprintMarkdown(first);

    expect(second).toEqual(first);
    first.lanes.forEach((lane) => expect(markdown).toContain(lane.title));
    first.cells.forEach((cell) => expect(markdown).toContain(cell.id));
    first.assetGaps.forEach((gap) => expect(markdown).toContain(gap.label));
    first.decisionRules.forEach((rule) =>
      expect(markdown).toContain(rule.label),
    );
    expect(markdown).toContain("does not predict performance");
  });
});
