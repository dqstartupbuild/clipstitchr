import { afterEach, describe, expect, it, vi } from "vitest";
import { scheduleSocialPublishingPost } from "@/lib/clipstitchr/client/scheduleSocialPublishingPost";

describe("scheduleSocialPublishingPost", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("uploads media before sending a small queue request", async () => {
    const r2UploadUrlBodies: object[] = [];
    const r2UploadBodies: BodyInit[] = [];
    const socialPublishingUploadBodies: object[] = [];
    const scheduleBodies: object[] = [];

    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: RequestInfo | URL, init?: RequestInit) => {
        const requestUrl = String(url);

        if (requestUrl === "/api/r2/upload-url") {
          r2UploadUrlBodies.push(JSON.parse(String(init?.body)) as object);

          return Response.json({
            key: `users/user_123/social-publishing-media/swipe_1/media-${r2UploadUrlBodies.length}.png`,
            url: `https://r2.example/${r2UploadUrlBodies.length}`,
          });
        }

        if (requestUrl.startsWith("https://r2.example/")) {
          r2UploadBodies.push(init?.body as BodyInit);

          return new Response(null, { status: 204 });
        }

        if (requestUrl === "/api/social-publishing/media/upload") {
          socialPublishingUploadBodies.push(JSON.parse(String(init?.body)) as object);

          return Response.json({
            media: {
              mediaId: `media_${socialPublishingUploadBodies.length}`,
              mediaKind: "image",
              mimeType: "image/png",
              name: `slide-${socialPublishingUploadBodies.length}.png`,
              sizeBytes: socialPublishingUploadBodies.length,
            },
          });
        }

        if (requestUrl === "/api/social-publishing/schedule") {
          scheduleBodies.push(JSON.parse(String(init?.body)) as object);

          return Response.json({
            post: { id: "post_1" },
            postReference: { postId: "post_1" },
          });
        }

        return Response.json({
          error: "Unexpected request",
          requestUrl,
        });
      }),
    );

    await scheduleSocialPublishingPost({
      caption: "Launch",
      hasAudio: false,
      mediaFiles: [
        {
          blob: new Blob(["one"]),
          fileName: "slide-1.png",
          mediaKind: "image",
        },
        {
          blob: new Blob(["two"], { type: "image/png" }),
          fileName: "slide-2.png",
          mediaKind: "image",
        },
      ],
      socialAccountIds: ["account_1", "account_2"],
      sourceId: "swipe_1",
      sourceType: "swipe",
      tiktokCommercialContentType: "none",
      tiktokConsentGiven: false,
      tiktokPrivacyLevel: "",
      title: "Launch Swipe",
      useQueue: true,
    });

    expect(r2UploadUrlBodies).toEqual([
      {
        contentType: "image/png",
        kind: "social-publishing-media",
        recordId: expect.stringMatching(/^swipe_1-/),
        sizeBytes: 3,
      },
      {
        contentType: "image/png",
        kind: "social-publishing-media",
        recordId: expect.stringMatching(/^swipe_1-/),
        sizeBytes: 3,
      },
    ]);
    expect(r2UploadBodies).toHaveLength(2);
    expect(socialPublishingUploadBodies).toEqual([
      {
        mimeType: "image/png",
        name: "slide-1.png",
        sizeBytes: 3,
        sourceId: "swipe_1",
        sourceObject: {
          contentType: "image/png",
          key: "users/user_123/social-publishing-media/swipe_1/media-1.png",
          size: 3,
        },
        sourceType: "swipe",
      },
      {
        mimeType: "image/png",
        name: "slide-2.png",
        sizeBytes: 3,
        sourceId: "swipe_1",
        sourceObject: {
          contentType: "image/png",
          key: "users/user_123/social-publishing-media/swipe_1/media-2.png",
          size: 3,
        },
        sourceType: "swipe",
      },
    ]);
    expect(scheduleBodies).toEqual([
      {
        caption: "Launch",
        hasAudio: false,
        mediaFiles: [
          {
            mediaId: "media_1",
            mediaKind: "image",
            mimeType: "image/png",
            name: "slide-1.png",
            sizeBytes: 1,
          },
          {
            mediaId: "media_2",
            mediaKind: "image",
            mimeType: "image/png",
            name: "slide-2.png",
            sizeBytes: 2,
          },
        ],
        socialAccountIds: ["account_1", "account_2"],
        sourceId: "swipe_1",
        sourceType: "swipe",
        tiktokCommercialContentType: "none",
        tiktokConsentGiven: false,
        tiktokPrivacyLevel: "",
        title: "Launch Swipe",
        useQueue: true,
      },
    ]);
  });

  it("omits the schedule time for immediate posts", async () => {
    const scheduleBodies: object[] = [];

    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: RequestInfo | URL, init?: RequestInit) => {
        const requestUrl = String(url);

        if (requestUrl === "/api/r2/upload-url") {
          return Response.json({
            key: "users/user_123/social-publishing-media/stitch_1/media.mp4",
            url: "https://r2.example/video",
          });
        }

        if (requestUrl === "https://r2.example/video") {
          return new Response(null, { status: 204 });
        }

        if (requestUrl === "/api/social-publishing/media/upload") {
          return Response.json({
            media: {
              mediaId: "media_1",
              mediaKind: "video",
              mimeType: "video/mp4",
              name: "launch.mp4",
              sizeBytes: 5,
            },
          });
        }

        if (requestUrl === "/api/social-publishing/schedule") {
          scheduleBodies.push(JSON.parse(String(init?.body)) as object);

          return Response.json({
            post: { id: "post_1" },
            postReference: { postId: "post_1" },
          });
        }

        return Response.json({ error: "Unexpected request", requestUrl });
      }),
    );

    await scheduleSocialPublishingPost({
      caption: "Launch",
      hasAudio: true,
      mediaFiles: [
        {
          blob: new Blob(["video"], { type: "video/mp4" }),
          fileName: "launch.mp4",
          mediaKind: "video",
        },
      ],
      socialAccountIds: ["account_1"],
      sourceId: "stitch_1",
      sourceType: "stitch",
      tiktokCommercialContentType: "none",
      tiktokConsentGiven: false,
      tiktokPrivacyLevel: "",
      title: "Launch Stitch",
      useQueue: false,
    });

    expect(scheduleBodies[0]).toMatchObject({
      useQueue: false,
    });
  });
});
