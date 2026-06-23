import { describe, expect, it } from "vitest";
import { createBrowserUploadVideoClipSaveArgs } from "@/lib/clipstitchr/client/createBrowserUploadVideoClipSaveArgs";

describe("createBrowserUploadVideoClipSaveArgs", () => {
  it("builds saved clip arguments from browser-normalized upload output", () => {
    const args = createBrowserUploadVideoClipSaveArgs({
      analysis: {
        mainPersonDescription: "Creator in kitchen",
        name: "Morning Demo",
        tags: ["Demo", "launch"],
        videoDescription: "Creator opens with the product.",
      },
      clipId: "clip_1",
      clipType: "demo",
      metadata: {
        aspectRatio: 1080 / 1920,
        audioCanDecode: true,
        duration: 12.5,
        hasAudio: true,
        height: 1920,
        mimeType: "video/mp4",
        rotation: 0,
        videoCanDecode: true,
        width: 1080,
      },
      mimeType: "video/mp4",
      originalName: "source.mov",
      originalSize: 42,
      posterObject: {
        contentType: "image/jpeg",
        key: "users/user_123/video-clips/clip_1/poster.jpg",
        size: 10,
      },
      productId: "product_1",
      sourceMimeType: "video/quicktime",
      updatedAt: "2026-06-23T00:00:00.000Z",
      videoObject: {
        contentType: "video/mp4",
        key: "users/user_123/video-clips/clip_1/video.mp4",
        size: 100,
      },
    });

    expect(args).toMatchObject({
      clipType: "demo",
      defaultTrimRange: { end: 12.5, start: 0 },
      duration: 12.5,
      hasAudio: true,
      height: 1920,
      id: "clip_1",
      mainPersonDescription: "Creator in kitchen",
      name: "Morning Demo",
      originalName: "source.mov",
      originalSize: 42,
      productId: "product_1",
      sourceMimeType: "video/quicktime",
      tags: ["demo", "launch"],
      videoDescription: "Creator opens with the product.",
      width: 1080,
    });
  });

  it("uses the file name when analysis does not return a name", () => {
    const args = createBrowserUploadVideoClipSaveArgs({
      analysis: {
        name: "",
        tags: [],
      },
      clipId: "clip_1",
      clipType: "ugc",
      metadata: {
        aspectRatio: 1080 / 1920,
        audioCanDecode: false,
        duration: 8,
        hasAudio: false,
        height: 1920,
        mimeType: "video/mp4",
        rotation: 0,
        videoCanDecode: true,
        width: 1080,
      },
      mimeType: "video/mp4",
      originalName: "ugc-hook.mov",
      originalSize: 42,
      posterObject: {
        contentType: "image/jpeg",
        key: "poster.jpg",
        size: 10,
      },
      sourceMimeType: "video/quicktime",
      updatedAt: "2026-06-23T00:00:00.000Z",
      videoObject: {
        contentType: "video/mp4",
        key: "video.mp4",
        size: 100,
      },
    });

    expect(args.name).toBe("ugc-hook");
    expect(args.tags).toEqual(["ugc"]);
  });
});
