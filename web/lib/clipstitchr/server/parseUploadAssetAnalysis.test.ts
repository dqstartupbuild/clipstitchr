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

  it("parses UGC video descriptions from upload analysis JSON", () => {
    expect(
      parseUploadAssetAnalysis(
        JSON.stringify({
          mainPersonDescription:
            "Round face, shoulder-length dark hair, and expressive brows.",
          videoDescription:
            "A creator holds a skincare bottle toward the camera in a bright bathroom.",
          outfitDescription: "Black tank top and small hoop earrings.",
          locationDescription: "Bright bathroom vanity with white tile.",
          poseDescription: "Holding the bottle near their face and smiling.",
          name: "Bathroom Skincare Hook",
          tags: ["skincare", "bathroom", "creator"],
        }),
        "ugc.mov",
      ),
    ).toEqual({
      mainPersonDescription:
        "Round face, shoulder-length dark hair, and expressive brows.",
      videoDescription:
        "A creator holds a skincare bottle toward the camera in a bright bathroom.",
      outfitDescription: "Black tank top and small hoop earrings.",
      locationDescription: "Bright bathroom vanity with white tile.",
      poseDescription: "Holding the bottle near their face and smiling.",
      name: "Bathroom Skincare Hook",
      tags: ["skincare", "bathroom", "creator"],
    });
  });

  it("parses demo product descriptions from upload analysis JSON", () => {
    expect(
      parseUploadAssetAnalysis(
        JSON.stringify({
          videoDescription:
            "A phone screen shows a scheduling workflow with a calendar picker.",
          productDescription:
            "A mobile app interface with a white calendar grid, blue action button, and appointment cards.",
          locationDescription: "Screen recording on a phone interface.",
          poseDescription: "Selecting a date and moving to the booking step.",
          name: "Calendar Booking Demo",
          tags: ["demo", "calendar", "booking"],
        }),
        "demo.mp4",
      ),
    ).toEqual({
      videoDescription:
        "A phone screen shows a scheduling workflow with a calendar picker.",
      productDescription:
        "A mobile app interface with a white calendar grid, blue action button, and appointment cards.",
      locationDescription: "Screen recording on a phone interface.",
      poseDescription: "Selecting a date and moving to the booking step.",
      name: "Calendar Booking Demo",
      tags: ["demo", "calendar", "booking"],
    });
  });
});
