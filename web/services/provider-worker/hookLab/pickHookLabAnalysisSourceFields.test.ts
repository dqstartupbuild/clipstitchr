import { describe, expect, it } from "vitest";
import { pickHookLabAnalysisSourceFields } from "./pickHookLabAnalysisSourceFields";

describe("pickHookLabAnalysisSourceFields", () => {
  it("keeps only requested fields with meaningful values", () => {
    expect(
      pickHookLabAnalysisSourceFields(
        {
          duration: 12,
          empty: "",
          falseValue: false,
          ignored: "private",
          nullValue: null,
          title: "Source title",
          zeroValue: 0,
        },
        ["title", "duration", "falseValue", "zeroValue", "empty", "nullValue"],
      ),
    ).toEqual({
      duration: 12,
      falseValue: false,
      title: "Source title",
      zeroValue: 0,
    });
  });

  it("returns an empty context without a source", () => {
    expect(pickHookLabAnalysisSourceFields(null, ["duration"])).toEqual({});
  });
});
