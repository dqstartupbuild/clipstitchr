import { describe, expect, it } from "vitest";
import { readStudioClipsCompletionEvidenceSnapshot } from "./readStudioClipsCompletionEvidenceSnapshot";

describe("readStudioClipsCompletionEvidenceSnapshot", () => {
  it("accepts silent output evidence but rejects untrusted storage proofs", () => {
    expect(
      readStudioClipsCompletionEvidenceSnapshot({
        renders: {
          "clip-1": {
            fileName: "clip.mp4",
            media: {
              container: "mp4",
              contentType: "video/mp4",
              durationSeconds: 10,
              hasAudio: false,
              hasVideo: true,
              height: 1920,
              sizeBytes: 100,
              videoCodec: "h264",
              width: 1080,
            },
          },
        },
        storage: {},
      }).renders["clip-1"].media,
    ).toMatchObject({ hasAudio: false });

    expect(() =>
      readStudioClipsCompletionEvidenceSnapshot({
        renders: {},
        storage: {
          "clip-1": {
            etag: "valid-etag",
            key: "../../outside",
          },
        },
      }),
    ).toThrow("completion evidence");
  });
});
