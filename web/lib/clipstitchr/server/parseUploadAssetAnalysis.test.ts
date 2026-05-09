import { describe, expect, it } from "vitest";
import { parseUploadAssetAnalysis } from "@/lib/clipstitchr/server/parseUploadAssetAnalysis";

describe("parseUploadAssetAnalysis", () => {
  it("parses avatar descriptions from upload analysis JSON", () => {
    expect(
      parseUploadAssetAnalysis(
        JSON.stringify({
          avatarDescription: "Oval face, dark wavy hair, and full brows.",
          outfitDescription: "Green jacket and white shirt.",
          locationDescription: "Sunny garden path.",
          name: "Garden Portrait",
          tags: ["portrait", "outdoor"],
        }),
        "source.jpg",
      ),
    ).toEqual({
      avatarDescription: "Oval face, dark wavy hair, and full brows.",
      outfitDescription: "Green jacket and white shirt.",
      locationDescription: "Sunny garden path.",
      name: "Garden Portrait",
      tags: ["portrait", "outdoor"],
    });
  });
});
