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
});
