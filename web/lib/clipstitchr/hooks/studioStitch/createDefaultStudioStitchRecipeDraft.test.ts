import { describe, expect, it } from "vitest";
import { createDefaultStudioStitchRecipeDraft } from "./createDefaultStudioStitchRecipeDraft";

describe("createDefaultStudioStitchRecipeDraft", () => {
  it("preselects a real Product Library handoff as the reaction source", () => {
    expect(
      createDefaultStudioStitchRecipeDraft("studio_clips_output_1")
        .reactionSourceIds,
    ).toEqual(["studio_clips_output_1"]);
  });
});
