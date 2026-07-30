import { describe, expect, it } from "vitest";
import { SocialNeedsAttentionError } from "../SocialNeedsAttentionError";
import { assertTikTokCapabilitiesMatch } from "./assertTikTokCapabilitiesMatch";

const controls = {
  allowComment: false,
  allowDuet: false,
  allowStitch: false,
  autoAddMusic: true,
  brandContentToggle: false,
  brandOrganicToggle: false,
  consentAcknowledged: true,
  isAigc: false,
  privacyLevel: "SELF_ONLY",
};

const creatorInfo = {
  comment_disabled: false,
  duet_disabled: false,
  stitch_disabled: false,
  max_video_post_duration_sec: 60,
  privacy_level_options: ["SELF_ONLY"],
};

describe("assertTikTokCapabilitiesMatch", () => {
  it("accepts a current direct-video configuration", () => {
    expect(() =>
      assertTikTokCapabilitiesMatch({
        controls,
        creatorInfo,
        durationSeconds: 30,
        isPhotoPost: false,
        publishMode: "direct",
      }),
    ).not.toThrow();
  });

  it.each([
    {
      name: "privacy changed",
      creator: { ...creatorInfo, privacy_level_options: ["PUBLIC_TO_EVERYONE"] },
      targetControls: controls,
      duration: 30,
    },
    {
      name: "video became too long",
      creator: creatorInfo,
      targetControls: controls,
      duration: 61,
    },
    {
      name: "comments became unavailable",
      creator: { ...creatorInfo, comment_disabled: true },
      targetControls: { ...controls, allowComment: true },
      duration: 30,
    },
  ])("holds when $name", ({ creator, targetControls, duration }) => {
    expect(() =>
      assertTikTokCapabilitiesMatch({
        controls: targetControls,
        creatorInfo: creator,
        durationSeconds: duration,
        isPhotoPost: false,
        publishMode: "direct",
      }),
    ).toThrow(SocialNeedsAttentionError);
  });

  it("does not allow photo posts in inbox mode", () => {
    expect(() =>
      assertTikTokCapabilitiesMatch({
        controls,
        creatorInfo,
        isPhotoPost: true,
        publishMode: "draft",
      }),
    ).toThrow("photo posts can be sent directly");
  });

  it("holds paid branded content with Only you visibility", () => {
    expect(() =>
      assertTikTokCapabilitiesMatch({
        controls: {
          ...controls,
          brandContentToggle: true,
        },
        creatorInfo,
        durationSeconds: 30,
        isPhotoPost: false,
        publishMode: "direct",
      }),
    ).toThrow("cannot use Only you visibility");
  });
});
