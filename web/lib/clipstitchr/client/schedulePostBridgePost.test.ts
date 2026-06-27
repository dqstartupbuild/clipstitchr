import { afterEach, describe, expect, it, vi } from "vitest";
import { schedulePostBridgePost } from "@/lib/clipstitchr/client/schedulePostBridgePost";

describe("schedulePostBridgePost", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("sends multiple media files in schedule form data", async () => {
    const bodies: FormData[] = [];

    vi.stubGlobal(
      "fetch",
      vi.fn(async (_url, init?: RequestInit) => {
        bodies.push(init?.body as FormData);

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

    const formData = bodies[0];
    const mediaFiles = formData.getAll("media");

    expect(mediaFiles).toHaveLength(2);
    expect(mediaFiles[0]).toEqual(expect.any(File));
    expect((mediaFiles[0] as File).name).toBe("slide-1.png");
    expect((mediaFiles[0] as File).type).toBe("image/png");
    expect(formData.get("socialAccountIds")).toBe("[1,2]");
  });

  it("omits the schedule time for immediate posts", async () => {
    const bodies: FormData[] = [];

    vi.stubGlobal(
      "fetch",
      vi.fn(async (_url, init?: RequestInit) => {
        bodies.push(init?.body as FormData);

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

    expect(bodies[0].has("scheduledAt")).toBe(false);
  });
});
