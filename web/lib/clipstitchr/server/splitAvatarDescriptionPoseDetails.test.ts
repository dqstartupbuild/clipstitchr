import { describe, expect, it } from "vitest";
import { splitAvatarDescriptionPoseDetails } from "@/lib/clipstitchr/server/splitAvatarDescriptionPoseDetails";

describe("splitAvatarDescriptionPoseDetails", () => {
  it("moves leaked posture details out of avatar identity", () => {
    expect(
      splitAvatarDescriptionPoseDetails(
        "young adult male with a slim build and light skin tone, short curly dark brown hair, light facial stubble, closed eyes with a gentle smile, straight eyebrows, medium nose, and relaxed posture with arms crossed",
      ),
    ).toEqual({
      avatarDescription:
        "young adult male with a slim build and light skin tone, short curly dark brown hair, light facial stubble, closed eyes with a gentle smile, straight eyebrows, medium nose",
      poseDescription: "relaxed posture with arms crossed",
    });
  });

  it("moves trailing pose phrases without removing stable traits", () => {
    expect(
      splitAvatarDescriptionPoseDetails(
        "oval face, dark wavy hair, full brows and standing with arms at their side",
      ),
    ).toEqual({
      avatarDescription: "oval face, dark wavy hair, full brows",
      poseDescription: "standing with arms at their side",
    });
  });
});
