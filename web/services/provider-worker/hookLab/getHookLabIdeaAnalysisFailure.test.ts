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

  it.each([
    "The imported video could not be downloaded.",
    "The imported link did not return a video.",
    "The imported video redirected too many times.",
    "The imported video response was empty.",
    "The imported video duration could not be read.",
    "The imported video URL expired.",
    "Hook Lab social import is missing its Apify dataset.",
    "Instagram returned an empty dataset.",
    "TikTok does not expose a usable source video.",
  ])("refreshes the social import after a source video failure: %s", (message) => {
    expect(getHookLabIdeaAnalysisFailure(new Error(message))).toEqual({
      failureCode: "source_video_unavailable",
      failureMessage:
        "That post did not share a usable video. Paste the hook text instead.",
    });
  });

  it("does not mistake a missing provider credential for missing source media", () => {
    expect(
      getHookLabIdeaAnalysisFailure(
        new Error("Missing REPLICATE_KEY or REPLICATE_API_TOKEN."),
      ),
    ).toEqual({
      failureCode: "analysis_failed",
      failureMessage:
        "We could not finish learning this idea. Try again in a moment.",
    });
  });

  it("labels only the known public-video duration validation as too long", () => {
    expect(
      getHookLabIdeaAnalysisFailure(
        new Error("Hook Lab supports public videos up to 180 seconds."),
      ),
    ).toEqual({
      failureCode: "video_too_long",
      failureMessage: "That video is longer than Hook Lab can analyze right now.",
    });
    expect(
      getHookLabIdeaAnalysisFailure(
        new Error("The provider was unavailable for 30 seconds."),
      ).failureCode,
    ).toBe("analysis_failed");
  });
});
