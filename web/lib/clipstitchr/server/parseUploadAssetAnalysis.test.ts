import { describe, expect, it } from "vitest";
import { parseUploadAssetAnalysis } from "@/lib/clipstitchr/server/parseUploadAssetAnalysis";

describe("parseUploadAssetAnalysis", () => {
  it("parses avatar descriptions from upload analysis JSON", () => {
    expect(
      parseUploadAssetAnalysis(
        JSON.stringify({
          avatarDescription: "Oval face, dark wavy hair, and full brows.",
          outfitDescription: "Blue jacket and white shirt.",
          locationDescription: "Sunny garden path.",
          poseDescription: "Standing with one shoulder angled toward camera.",
          name: "Garden Portrait",
          tags: ["portrait", "outdoor"],
        }),
        "source.jpg",
      ),
    ).toEqual({
      avatarDescription: "Oval face, dark wavy hair, and full brows.",
      outfitDescription: "Blue jacket and white shirt.",
      locationDescription: "Sunny garden path.",
      poseDescription: "Standing with one shoulder angled toward camera.",
      name: "Garden Portrait",
      tags: ["portrait", "outdoor"],
    });
  });

  it("uses leaked pose details when analysis leaves poseDescription empty", () => {
    expect(
      parseUploadAssetAnalysis(
        JSON.stringify({
          avatarDescription:
            "medium nose, straight eyebrows, and relaxed posture with arms crossed",
          name: "Crossed Arms Portrait",
          tags: ["portrait"],
        }),
        "source.jpg",
      ),
    ).toEqual({
      avatarDescription: "medium nose, straight eyebrows",
      name: "Crossed Arms Portrait",
      poseDescription: "relaxed posture with arms crossed",
      tags: ["portrait"],
    });
  });
});
