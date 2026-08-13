import { describe, expect, it } from "vitest";
import type { PublishingCompatibilityResponse } from "@/lib/clipstitchr/publishing/client/contracts/PublishingCompatibilityResponse";
import type { PublishingComposerDraft } from "@/lib/clipstitchr/publishing/client/contracts/PublishingComposerDraft";
import type { PublishingIntegration } from "@/lib/clipstitchr/publishing/client/contracts/PublishingIntegration";
import { createPublishingComposerValidation } from "@/lib/clipstitchr/publishing/client/createPublishingComposerValidation";

const nowEpochMilliseconds = Date.UTC(2026, 7, 2, 16, 0, 0);

const integration: PublishingIntegration = {
  avatarUrl: null,
  displayName: "Studio account",
  expiresAt: null,
  id: "integration_tiktok",
  provider: "tiktok",
  status: "connected",
  statusMessage: null,
  username: "clipstitchr",
};

const youTubeIntegration: PublishingIntegration = {
  avatarUrl: null,
  displayName: "YouTube channel",
  expiresAt: null,
  id: "integration_youtube",
  provider: "youtube",
  status: "connected",
  statusMessage: null,
  username: "ClipStitchr",
};

const readyCompatibility: PublishingCompatibilityResponse = {
  destinations: [
    {
      integrationId: integration.id,
      issues: [],
      status: "ready",
    },
  ],
  mediaRevision: "media-revision-1",
};

function createDraft(): PublishingComposerDraft {
  return {
    caption: "A saved post",
    destinationIds: [integration.id],
    idempotencyKey: "publish-request-1",
    intent: "publish-now",
    localDateTime: "",
    media: { kind: "stitch", recordId: "stitch_1" },
    settingsByIntegrationId: {
      [integration.id]: {
        allowComment: true,
        allowDuet: true,
        allowStitch: true,
        autoAddMusic: false,
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
    utcOffsetMinutes: null,
  };
}

describe("createPublishingComposerValidation", () => {
  it("keeps TikTok inbox delivery distinct from direct-post consent", () => {
    const validation = createPublishingComposerValidation({
      acknowledgedWarnings: new Set(),
      compatibility: readyCompatibility,
      draft: createDraft(),
      integrations: [integration],
      isRestored: true,
      nowEpochMilliseconds,
    });

    expect(validation).toEqual({ destinationErrors: {}, formError: null });
  });

  it("requires fresh creator choices, visibility, and consent for direct posting", () => {
    const draft = createDraft();
    const settings = draft.settingsByIntegrationId[integration.id];
    if (settings.provider !== "tiktok") {
      throw new Error("Expected TikTok settings.");
    }
    draft.settingsByIntegrationId[integration.id] = {
      ...settings,
      mode: "direct",
    };

    const validation = createPublishingComposerValidation({
      acknowledgedWarnings: new Set(),
      compatibility: readyCompatibility,
      draft,
      integrations: [integration],
      isRestored: true,
      nowEpochMilliseconds,
    });

    expect(validation.destinationErrors[integration.id]).toEqual(
      expect.arrayContaining([
        "Choose who can see this TikTok post.",
        "Refresh TikTok account choices before posting directly.",
        "Confirm the current TikTok settings before direct posting.",
      ]),
    );
  });

  it("blocks an unacknowledged media warning and allows the acknowledged warning", () => {
    const compatibility: PublishingCompatibilityResponse = {
      destinations: [
        {
          integrationId: integration.id,
          issues: [
            {
              code: "provider_crop",
              message: "TikTok may crop the first frame.",
              severity: "warning",
            },
          ],
          status: "warning",
        },
      ],
      mediaRevision: "media-revision-2",
    };

    const blocked = createPublishingComposerValidation({
      acknowledgedWarnings: new Set(),
      compatibility,
      draft: createDraft(),
      integrations: [integration],
      isRestored: true,
      nowEpochMilliseconds,
    });
    const allowed = createPublishingComposerValidation({
      acknowledgedWarnings: new Set([integration.id]),
      compatibility,
      draft: createDraft(),
      integrations: [integration],
      isRestored: true,
      nowEpochMilliseconds,
    });

    expect(blocked.destinationErrors[integration.id]).toContain(
      "Review and acknowledge the media warning before continuing.",
    );
    expect(allowed.destinationErrors).toEqual({});
  });

  it("requires an exact future instant when scheduling", () => {
    const draft = createDraft();
    draft.intent = "schedule";
    draft.localDateTime = "2026-08-02T11:59";
    draft.utcOffsetMinutes = -240;

    const validation = createPublishingComposerValidation({
      acknowledgedWarnings: new Set(),
      compatibility: readyCompatibility,
      draft,
      integrations: [integration],
      isRestored: true,
      nowEpochMilliseconds,
    });

    expect(validation.formError).toBe(
      "Choose a schedule at least one minute in the future.",
    );
  });

  it("requires explicit bounded YouTube metadata and audience intent", () => {
    const draft = createDraft();
    draft.destinationIds = [youTubeIntegration.id];
    draft.settingsByIntegrationId = {
      [youTubeIntegration.id]: {
        description: "",
        madeForKids: null,
        provider: "youtube",
        tags: ["camera setup", "camera setup"],
        thumbnail: null,
        title: " ",
        visibility: "private",
      },
    };
    const compatibility: PublishingCompatibilityResponse = {
      destinations: [
        {
          integrationId: youTubeIntegration.id,
          issues: [],
          status: "ready",
        },
      ],
      mediaRevision: "media-revision-youtube",
    };

    const blocked = createPublishingComposerValidation({
      acknowledgedWarnings: new Set(),
      compatibility,
      draft,
      integrations: [youTubeIntegration],
      isRestored: true,
      nowEpochMilliseconds,
    });

    expect(blocked.destinationErrors[youTubeIntegration.id]).toEqual(
      expect.arrayContaining([
        "Use a YouTube title between 2 and 100 characters.",
        "Choose whether this YouTube video is made for kids.",
        "Review the YouTube tags. Keep them unique and within YouTube’s 500-character total.",
      ]),
    );

    draft.settingsByIntegrationId[youTubeIntegration.id] = {
      description: "A clear description",
      madeForKids: false,
      provider: "youtube",
      tags: ["camera setup", "vertical video"],
      thumbnail: null,
      title: "Camera setup in one minute",
      visibility: "unlisted",
    };

    expect(
      createPublishingComposerValidation({
        acknowledgedWarnings: new Set(),
        compatibility,
        draft,
        integrations: [youTubeIntegration],
        isRestored: true,
        nowEpochMilliseconds,
      }).destinationErrors,
    ).toEqual({});
  });
});
