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
      customMediaIdsByPlatform: {
        instagram: ["https://cdn.zernio.test/instagram-feed.png"],
      },
      mediaIds: ["https://cdn.zernio.test/vertical.png"],
      mediaKind: "image",
      scheduledAt: "2026-06-27T12:00:00.000Z",
      tiktokCommercialContentType: "none",
      tiktokConsentGiven: false,
      tiktokPrivacyLevel: "",
      title: "Launch title",
      useQueue: false,
    });

    expect(bodies[0]).toMatchObject({
      platforms: [
        {
          accountId: "instagram_1",
          customMedia: [
            {
              type: "image",
              url: "https://cdn.zernio.test/instagram-feed.png",
            },
          ],
          platform: "instagram",
        },
      ],
      scheduledFor: "2026-06-27T12:00:00.000Z",
      timezone: "UTC",
    });
    expect(bodies[0]).not.toHaveProperty("queuedFromProfile");
    expect(bodies[0]).not.toHaveProperty("tiktokSettings");
  });

  it("keeps the explicit ClipStitchr title for YouTube Shorts", async () => {
    const bodies: object[] = [];

    vi.stubGlobal(
      "fetch",
      vi.fn(async (_url: RequestInfo | URL, init?: RequestInit) => {
        bodies.push(JSON.parse(String(init?.body)) as object);

        return Response.json({
          post: {
            _id: "post_1",
            content: "Caption body",
            createdAt: "2026-08-11T00:00:00.000Z",
            platforms: [{ accountId: "youtube_1" }],
            status: "publishing",
          },
        });
      }),
    );

    await createSocialPublishingPost({
      accounts: [createAccount("youtube_1", "youtube")],
      apiKey: "zernio_test_key",
      caption: "Caption body",
      mediaIds: ["https://cdn.zernio.test/short.mp4"],
      mediaKind: "video",
      scheduledAt: null,
      tiktokCommercialContentType: "none",
      tiktokConsentGiven: false,
      tiktokPrivacyLevel: "",
      title: "Explicit Short title",
      useQueue: false,
    });

    expect(bodies[0]).toMatchObject({
      platforms: [
        {
          accountId: "youtube_1",
          platform: "youtube",
          platformSpecificData: { title: "Explicit Short title" },
        },
      ],
      title: "Explicit Short title",
    });
  });

  it("uses the first Swipe line as a TikTok photo title and the rest as its description", async () => {
    const bodies: object[] = [];
    const title = "A".repeat(95);
    const caption = `${title}\n\n${"Long caption body. ".repeat(70)}\n\n#fitness`;
    const tiktokCaption = `${"Long caption body. ".repeat(70)}\n\n#fitness`;

    vi.stubGlobal(
      "fetch",
      vi.fn(async (_url: RequestInfo | URL, init?: RequestInit) => {
        bodies.push(JSON.parse(String(init?.body)) as object);

        return Response.json({
          post: {
            _id: "post_1",
            content: title.slice(0, 90),
            createdAt: "2026-08-11T00:00:00.000Z",
            platforms: [
              { accountId: "tiktok_1" },
              { accountId: "instagram_1" },
            ],
            scheduledFor: "2026-08-12T12:00:00.000Z",
            status: "scheduled",
          },
        });
      }),
    );

    await createSocialPublishingPost({
      accounts: [
        createAccount("tiktok_1", "tiktok"),
        createAccount("instagram_1", "instagram"),
      ],
      apiKey: "zernio_test_key",
      caption,
      mediaIds: ["https://cdn.zernio.test/slide.png"],
      mediaKind: "image",
      scheduledAt: null,
      tiktokCaption,
      tiktokCommercialContentType: "brand_organic",
      tiktokConsentGiven: true,
      tiktokPrivacyLevel: "PUBLIC_TO_EVERYONE",
      title,
      useQueue: true,
    });

    expect(bodies[0]).toMatchObject({
      content: title.slice(0, 90),
      platforms: [
        { accountId: "tiktok_1", platform: "tiktok" },
        {
          accountId: "instagram_1",
          customContent: caption,
          platform: "instagram",
        },
      ],
      tiktokSettings: {
        description: tiktokCaption,
        mediaType: "photo",
      },
    });
    expect(String((bodies[0] as { content: string }).content)).toHaveLength(90);
  });
});
