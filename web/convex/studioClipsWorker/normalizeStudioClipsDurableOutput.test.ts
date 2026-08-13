import { describe, expect, it } from "vitest";
import { normalizeStudioClipsDurableOutput } from "./normalizeStudioClipsDurableOutput";

const owner = { ownerId: "user_1", productId: "product_1", taskId: "task_1" };

describe("normalizeStudioClipsDurableOutput", () => {
  it("accepts the exact worker-owned durable output namespace", () => {
    expect(
      normalizeStudioClipsDurableOutput(
        {
          artifactId: "clip_1",
          audioCodec: "aac",
          contentType: "video/mp4",
          durationSeconds: 12,
          fileName: "clip.mp4",
          hasAudio: true,
          height: 1920,
          objectKey:
            "users/user_1/studio/v1/studio-clips/product_1/task_1/clip_1/clip.mp4",
          sha256: "a".repeat(64),
          sizeBytes: 100,
          videoCodec: "h264",
          width: 1080,
        },
        owner,
      ),
    ).toMatchObject({ artifactId: "clip_1", sha256: "a".repeat(64) });
  });

  it("rejects another task namespace, query material, and invalid digests", () => {
    expect(() =>
      normalizeStudioClipsDurableOutput(
        {
          artifactId: "clip_1",
          contentType: "video/mp4",
          durationSeconds: 12,
          hasAudio: false,
          height: 1920,
          objectKey:
            "users/user_1/studio/v1/studio-clips/product_1/other/clip_1/clip.mp4",
          sha256: "a".repeat(64),
          sizeBytes: 100,
          videoCodec: "h264",
          width: 1080,
        },
        owner,
      ),
    ).toThrow("outside");
    expect(() =>
      normalizeStudioClipsDurableOutput(
        {
          artifactId: "clip_1",
          contentType: "video/mp4",
          durationSeconds: 12,
          hasAudio: false,
          height: 1920,
          objectKey:
            "users/user_1/studio/v1/studio-clips/product_1/task_1/clip_1/clip.mp4?token=x",
          sha256: "bad",
          sizeBytes: 100,
          videoCodec: "h264",
          width: 1080,
        },
        owner,
      ),
    ).toThrow();
    expect(() =>
      normalizeStudioClipsDurableOutput(
        {
          artifactId: "clip_1",
          contentType: "video/mp4",
          durationSeconds: 12,
          hasAudio: false,
          height: 1920,
          objectKey:
            "users/user_1/studio/v1/studio-clips/product_1/task_1/clip_1/../private.mp4",
          sha256: "a".repeat(64),
          sizeBytes: 100,
          videoCodec: "h264",
          width: 1080,
        },
        owner,
      ),
    ).toThrow("outside");
  });

  it("requires complete probed render metadata", () => {
    expect(() =>
      normalizeStudioClipsDurableOutput(
        {
          artifactId: "clip_1",
          contentType: "video/mp4",
          durationSeconds: 12,
          hasAudio: true,
          height: 1920,
          objectKey:
            "users/user_1/studio/v1/studio-clips/product_1/task_1/clip_1/clip.mp4",
          sha256: "a".repeat(64),
          sizeBytes: 100,
          videoCodec: "h264",
          width: 1080,
        },
        owner,
      ),
    ).toThrow("audio codec");
  });
});
