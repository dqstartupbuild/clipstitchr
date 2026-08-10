import { afterEach, describe, expect, it, vi } from "vitest";
import { createSocialPublishingPost } from "@/lib/clipstitchr/server/socialPublishing/createSocialPublishingPost";
import type { SocialPublishingSocialAccount } from "@/lib/clipstitchr/types/SocialPublishingSocialAccount";

vi.mock("@/lib/clipstitchr/server/socialPublishing/reserveSocialPublishingProviderRequest", () => ({
  reserveSocialPublishingProviderRequest: vi.fn(),
}));

function createAccount(
  id: string,
  platform: SocialPublishingSocialAccount["platform"],
): SocialPublishingSocialAccount {
  return {
    displayName: id,
    id,
    isActive: true,
    needsReconnection: false,
    platform,
    profileId: "profile_1",
    username: id,
  };
}

describe("createSocialPublishingPost", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("creates a queued TikTok post with required consent settings", async () => {
    const bodies: object[] = [];
    const headers: HeadersInit[] = [];

    vi.stubGlobal(
      "fetch",
      vi.fn(async (_url: RequestInfo | URL, init?: RequestInit) => {
        bodies.push(JSON.parse(String(init?.body)) as object);
        headers.push(init?.headers ?? {});

        return Response.json({
          post: {
            _id: "post_1",
            content: "Launch",
            createdAt: "2026-06-26T00:00:00.000Z",
            platforms: [{ accountId: "tiktok_1" }],
            scheduledFor: "2026-06-27T12:00:00.000Z",
            status: "scheduled",
          },
        });
      }),
    );

    const post = await createSocialPublishingPost({
      accounts: [createAccount("tiktok_1", "tiktok")],
      apiKey: "zernio_test_key",
      caption: "Launch",
      mediaIds: ["https://cdn.zernio.test/media.mp4"],
      mediaKind: "video",
      scheduledAt: null,
      tiktokCommercialContentType: "brand_organic",
      tiktokConsentGiven: true,
      tiktokPrivacyLevel: "PUBLIC_TO_EVERYONE",
      title: "Launch title",
      useQueue: true,
    });

    expect(bodies[0]).toMatchObject({
      content: "Launch",
      mediaItems: [
        { type: "video", url: "https://cdn.zernio.test/media.mp4" },
      ],
      platforms: [{ accountId: "tiktok_1", platform: "tiktok" }],
      queuedFromProfile: "profile_1",
      tiktokSettings: {
        commercialContentType: "brand_organic",
        contentPreviewConfirmed: true,
        expressConsentGiven: true,
        privacyLevel: "PUBLIC_TO_EVERYONE",
      },
    });
    expect(bodies[0]).not.toHaveProperty("scheduledFor");
    expect(new Headers(headers[0]).get("x-request-id")).toBeTruthy();
    expect(post.id).toBe("post_1");
  });

  it("creates a custom scheduled Instagram post", async () => {
    const bodies: object[] = [];

    vi.stubGlobal(
      "fetch",
      vi.fn(async (_url: RequestInfo | URL, init?: RequestInit) => {
        bodies.push(JSON.parse(String(init?.body)) as object);

        return Response.json({
          existingPost: {
            _id: "post_1",
            content: "Launch",
            createdAt: "2026-06-26T00:00:00.000Z",
            platforms: [{ accountId: "instagram_1" }],
            scheduledFor: "2026-06-27T12:00:00.000Z",
            status: "scheduled",
          },
        });
      }),
    );

    await createSocialPublishingPost({
      accounts: [createAccount("instagram_1", "instagram")],
      apiKey: "zernio_test_key",
      caption: "Launch",
      mediaIds: ["https://cdn.zernio.test/media.mp4"],
      mediaKind: "video",
      scheduledAt: "2026-06-27T12:00:00.000Z",
      tiktokCommercialContentType: "none",
      tiktokConsentGiven: false,
      tiktokPrivacyLevel: "",
      title: "Launch title",
      useQueue: false,
    });

    expect(bodies[0]).toMatchObject({
      scheduledFor: "2026-06-27T12:00:00.000Z",
      timezone: "UTC",
    });
    expect(bodies[0]).not.toHaveProperty("queuedFromProfile");
    expect(bodies[0]).not.toHaveProperty("tiktokSettings");
  });
});
