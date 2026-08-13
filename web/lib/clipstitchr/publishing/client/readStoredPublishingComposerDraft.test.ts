import { describe, expect, it } from "vitest";
import { readStoredPublishingComposerDraft } from "@/lib/clipstitchr/publishing/client/readStoredPublishingComposerDraft";

describe("readStoredPublishingComposerDraft", () => {
  it("restores safe draft fields but requires fresh TikTok consent", () => {
    const draft = readStoredPublishingComposerDraft(
      JSON.stringify({
        caption: "Saved caption",
        destinationIds: ["integration_1"],
        idempotencyKey: "publish_1",
        intent: "publish-now",
        localDateTime: "",
        media: { kind: "stitch", recordId: "stitch_1" },
        settingsByIntegrationId: {
          integration_1: {
            allowComment: true,
            allowDuet: true,
            allowStitch: true,
            autoAddMusic: false,
            brandContent: false,
            brandOrganic: true,
            consentConfirmed: true,
            creatorInfoFetchedAt: 123,
            isAigc: false,
            mode: "direct",
            privacyLevel: "SELF_ONLY",
            provider: "tiktok",
          },
        },
        timeZone: "America/Detroit",
        utcOffsetMinutes: null,
      }),
    );

    expect(draft?.caption).toBe("Saved caption");
    expect(draft?.settingsByIntegrationId.integration_1).toMatchObject({
      consentConfirmed: false,
      creatorInfoFetchedAt: null,
    });
  });

  it("drops malformed or oversized stored state", () => {
    expect(readStoredPublishingComposerDraft("not-json")).toBeNull();
    expect(readStoredPublishingComposerDraft("x".repeat(100_001))).toBeNull();
  });

  it("drops a draft with an invalid IANA time zone", () => {
    expect(
      readStoredPublishingComposerDraft(
        JSON.stringify({
          caption: "",
          destinationIds: [],
          idempotencyKey: "publish_1",
          intent: "draft",
          localDateTime: "",
          media: null,
          settingsByIntegrationId: {},
          timeZone: "Not/A_Time_Zone",
          utcOffsetMinutes: null,
        }),
      ),
    ).toBeNull();
  });

  it("restores only the browser-safe YouTube thumbnail selection", () => {
    const draft = readStoredPublishingComposerDraft(
      JSON.stringify({
        caption: "",
        destinationIds: ["youtube_1"],
        idempotencyKey: "publish_1",
        intent: "draft",
        localDateTime: "",
        media: { kind: "studio-clip-output", recordId: "clip_1" },
        settingsByIntegrationId: {
          youtube_1: {
            description: "Video description",
            madeForKids: false,
            provider: "youtube",
            tags: ["camera setup"],
            thumbnail: {
              media: { kind: "library-media", recordId: "image_1" },
              mediaRevision: "a".repeat(64),
            },
            title: "Camera setup",
            visibility: "private",
          },
        },
        timeZone: "America/Detroit",
        utcOffsetMinutes: null,
      }),
    );

    expect(draft?.settingsByIntegrationId.youtube_1).toMatchObject({
      provider: "youtube",
      thumbnail: {
        media: { kind: "library-media", recordId: "image_1" },
        mediaRevision: "a".repeat(64),
      },
    });
    expect(JSON.stringify(draft)).not.toContain("objectKey");
  });

  it("rejects a stored YouTube thumbnail that includes a browser object key", () => {
    expect(
      readStoredPublishingComposerDraft(
        JSON.stringify({
          caption: "",
          destinationIds: ["youtube_1"],
          idempotencyKey: "publish_1",
          intent: "draft",
          localDateTime: "",
          media: { kind: "studio-clip-output", recordId: "clip_1" },
          settingsByIntegrationId: {
            youtube_1: {
              description: "",
              madeForKids: true,
              provider: "youtube",
              tags: [],
              thumbnail: {
                media: {
                  kind: "library-media",
                  objectKey: "private/image.png",
                  recordId: "image_1",
                },
                mediaRevision: "a".repeat(64),
              },
              title: "Camera setup",
              visibility: "private",
            },
          },
          timeZone: "America/Detroit",
          utcOffsetMinutes: null,
        }),
      ),
    ).toBeNull();
  });
});
