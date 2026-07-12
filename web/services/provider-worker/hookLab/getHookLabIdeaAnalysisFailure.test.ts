import { describe, expect, it } from "vitest";
import { getHookLabIdeaAnalysisFailure } from "./getHookLabIdeaAnalysisFailure";

describe("getHookLabIdeaAnalysisFailure", () => {
  it("labels an ambiguous Actor start separately from ordinary analysis", () => {
    expect(
      getHookLabIdeaAnalysisFailure(
        new Error("The social import start could not be confirmed."),
      ),
    ).toEqual({
      failureCode: "social_import_start_unconfirmed",
      failureMessage:
        "We could not confirm that import. Try again when you are ready.",
    });
  });
});
