import { describe, expect, it } from "vitest";
import type { PublishingComposerDraft } from "@/lib/clipstitchr/publishing/client/contracts/PublishingComposerDraft";
import type { PublishingIntegration } from "@/lib/clipstitchr/publishing/client/contracts/PublishingIntegration";
import { createPublishingPostRequestFromDraft } from "@/lib/clipstitchr/publishing/client/createPublishingPostRequestFromDraft";

const integrations: PublishingIntegration[] = [
  {
    avatarUrl: null,
    displayName: "Instagram account",
    expiresAt: null,
    id: "instagram_1",
    provider: "instagram",
    status: "connected",
    statusMessage: null,
    username: null,
  },
  {
    avatarUrl: null,
    displayName: "YouTube channel",
    expiresAt: null,
    id: "youtube_1",
    provider: "youtube",
    status: "connected",
    statusMessage: null,
    username: null,
  },
  {
    avatarUrl: null,
    displayName: "TikTok account",
    expiresAt: null,
    id: "tiktok_1",
    provider: "tiktok",
    status: "connected",
    statusMessage: null,
    username: null,
  },
];

function createDraft(): PublishingComposerDraft {
  return {
    caption: "Saved caption",
    destinationIds: ["instagram_1", "tiktok_1"],
    idempotencyKey: "publishing-request-1",
    intent: "schedule",
    localDateTime: "2026-08-04T09:30",
    media: { kind: "swipe", recordId: "swipe_1" },
    settingsByIntegrationId: {
      instagram_1: { placement: "story", provider: "instagram" },
      tiktok_1: {
        allowComment: true,
        allowDuet: true,
        allowStitch: true,
        autoAddMusic: true,
        brandContent: false,
        brandOrganic: false,
        consentConfirmed: false,
        creatorInfoFetchedAt: null,
        isAigc: false,
        mode: "inbox",
        privacyLevel: "",
        provider: "tiktok",
      },
    },
    timeZone: "America/Detroit",
    utcOffsetMinutes: -240,
  };
}

describe("createPublishingPostRequestFromDraft", () => {
  it("builds exact provider settings and preserves the schedule choice", () => {
    expect(
      createPublishingPostRequestFromDraft({
        draft: createDraft(),
        integrations,
        mediaRevision: "media-revision-1",
      }),
    ).toEqual({
      caption: "Saved caption",
      destinations: [
        {
          integrationId: "instagram_1",
          provider: "instagram",
          settings: { placement: "story" },
        },
        {
          integrationId: "tiktok_1",
          provider: "tiktok",
          settings: { mode: "inbox" },
        },
      ],
      idempotencyKey: "publishing-request-1",
      intent: "schedule",
      media: { kind: "swipe", recordId: "swipe_1" },
      mediaRevision: "media-revision-1",
      schedule: {
        localDateTime: "2026-08-04T09:30",
        timeZone: "America/Detroit",
        utcOffsetMinutes: -240,
      },
    });
  });

  it("builds browser-safe YouTube settings without Product IDs or media manifests", () => {
    const draft = createDraft();
    draft.destinationIds = ["youtube_1"];
    draft.intent = "publish-now";
    draft.settingsByIntegrationId = {
      youtube_1: {
        description: "  The complete setup  ",
        madeForKids: false,
        provider: "youtube",
        tags: [" camera setup ", "vertical video", ""],
        thumbnail: {
          media: { kind: "library-media", recordId: "thumbnail_1" },
          mediaRevision: "a".repeat(64),
        },
        title: "  Camera setup  ",
        visibility: "unlisted",
      },
    };

    const request = createPublishingPostRequestFromDraft({
      draft,
      integrations,
      mediaRevision: "video-revision-1",
    });

    expect(request.destinations).toEqual([
      {
        integrationId: "youtube_1",
        provider: "youtube",
        settings: {
          description: "The complete setup",
          madeForKids: false,
          tags: ["camera setup", "vertical video"],
          thumbnail: {
            media: { kind: "library-media", recordId: "thumbnail_1" },
            mediaRevision: "a".repeat(64),
          },
          title: "Camera setup",
          visibility: "unlisted",
        },
      },
    ]);
    expect(request).not.toHaveProperty("productId");
    expect(JSON.stringify(request)).not.toContain("objectKey");
    expect(JSON.stringify(request)).not.toContain("resolvedMedia");
  });

  it("omits an empty YouTube description so the service can use the shared caption fallback", () => {
    const draft = createDraft();
    draft.destinationIds = ["youtube_1"];
    draft.intent = "publish-now";
    draft.settingsByIntegrationId = {
      youtube_1: {
        description: "   ",
        madeForKids: true,
        provider: "youtube",
        tags: [],
        thumbnail: null,
        title: "Fallback description example",
        visibility: "private",
      },
    };

    const request = createPublishingPostRequestFromDraft({
      draft,
      integrations,
      mediaRevision: "video-revision-1",
    });
    const destination = request.destinations[0];

    expect(destination?.provider).toBe("youtube");
    expect(destination?.settings).not.toHaveProperty("description");
    expect(request.caption).toBe("Saved caption");
  });
});
