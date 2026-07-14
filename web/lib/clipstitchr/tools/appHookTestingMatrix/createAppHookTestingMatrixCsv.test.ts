import { describe, expect, it } from "vitest";
import { buildAppHookTestingMatrix } from "@/lib/clipstitchr/tools/appHookTestingMatrix/buildAppHookTestingMatrix";
import { createAppHookTestingMatrixCsv } from "@/lib/clipstitchr/tools/appHookTestingMatrix/createAppHookTestingMatrixCsv";
import { defaultAppHookTestingMatrixInput } from "@/lib/clipstitchr/tools/appHookTestingMatrix/defaultAppHookTestingMatrixInput";

describe("createAppHookTestingMatrixCsv", () => {
  it("exports every matrix cell with the stable test context", () => {
    const result = buildAppHookTestingMatrix(defaultAppHookTestingMatrixInput);
    const csv = createAppHookTestingMatrixCsv(result);

    expect(csv).toContain(
      "cell,stage,changed_variable,hook,visual,cta,instruction,stable_audience,stable_offer",
    );
    expect(csv.split("\r\n")).toHaveLength(result.cells.length + 1);
    expect(csv).toContain(result.audience);
    expect(csv).toContain(result.offer);
    expect(csv).toContain(result.cells[0].hook);
  });
});
