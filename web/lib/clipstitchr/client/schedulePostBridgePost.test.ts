import { afterEach, describe, expect, it, vi } from "vitest";
import { schedulePostBridgePost } from "@/lib/clipstitchr/client/schedulePostBridgePost";

describe("schedulePostBridgePost", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("uploads media before sending a small schedule request", async () => {
    const uploadUrlBodies: object[] = [];
    const directUploadBodies: BodyInit[] = [];
    const scheduleBodies: object[] = [];

    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: RequestInfo | URL, init?: RequestInit) => {
        const requestUrl = String(url);

        if (requestUrl === "/api/post-bridge/media/upload-url") {
          uploadUrlBodies.push(JSON.parse(String(init?.body)) as object);

          return Response.json({
            media: {
              mediaId: `media_${uploadUrlBodies.length}`,
              mediaKind: "image",
              mimeType: "image/png",
              name: `slide-${uploadUrlBodies.length}.png`,
              sizeBytes: uploadUrlBodies.length,
            },
            uploadUrl: `https://uploads.example/${uploadUrlBodies.length}`,
          });
        }

        if (requestUrl.startsWith("https://uploads.example/")) {
          directUploadBodies.push(init?.body as BodyInit);

          return new Response(null, { status: 204 });
        }

        scheduleBodies.push(JSON.parse(String(init?.body)) as object);

        return Response.json({
          post: { id: "post_1" },
          postReference: { postId: "post_1" },
        });
      }),
    );

    await schedulePostBridgePost({
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
      scheduledAt: "2026-06-27T12:00:00.000Z",
      socialAccountIds: [1, 2],
      sourceId: "swipe_1",
      sourceType: "swipe",
      title: "Launch Swipe",
    });

    expect(uploadUrlBodies).toEqual([
      {
        mimeType: "image/png",
        name: "slide-1.png",
        sizeBytes: 3,
        sourceId: "swipe_1",
        sourceType: "swipe",
      },
      {
        mimeType: "image/png",
        name: "slide-2.png",
        sizeBytes: 3,
        sourceId: "swipe_1",
        sourceType: "swipe",
      },
    ]);
    expect(directUploadBodies).toHaveLength(2);
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
        scheduledAt: "2026-06-27T12:00:00.000Z",
        socialAccountIds: [1, 2],
        sourceId: "swipe_1",
        sourceType: "swipe",
        title: "Launch Swipe",
      },
    ]);
  });

  it("omits the schedule time for immediate posts", async () => {
    const scheduleBodies: object[] = [];

    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: RequestInfo | URL, init?: RequestInit) => {
        const requestUrl = String(url);

        if (requestUrl === "/api/post-bridge/media/upload-url") {
          return Response.json({
            media: {
              mediaId: "media_1",
              mediaKind: "video",
              mimeType: "video/mp4",
              name: "launch.mp4",
              sizeBytes: 5,
            },
            uploadUrl: "https://uploads.example/video",
          });
        }

        if (requestUrl === "https://uploads.example/video") {
          return new Response(null, { status: 204 });
        }

        scheduleBodies.push(JSON.parse(String(init?.body)) as object);

        return Response.json({
          post: { id: "post_1" },
          postReference: { postId: "post_1" },
        });
      }),
    );

    await schedulePostBridgePost({
      caption: "Launch",
      hasAudio: true,
      mediaFiles: [
        {
          blob: new Blob(["video"], { type: "video/mp4" }),
          fileName: "launch.mp4",
          mediaKind: "video",
        },
      ],
      scheduledAt: null,
      socialAccountIds: [1],
      sourceId: "stitch_1",
      sourceType: "stitch",
      title: "Launch Stitch",
    });

    expect(scheduleBodies[0]).toMatchObject({
      scheduledAt: null,
    });
  });
});
