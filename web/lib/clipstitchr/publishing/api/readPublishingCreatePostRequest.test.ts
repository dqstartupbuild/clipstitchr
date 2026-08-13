import { describe, expect, it } from "vitest";

import { readPublishingCreatePostRequest } from "@/lib/clipstitchr/publishing/api/readPublishingCreatePostRequest";

const mediaRevision = "a".repeat(64);

function createRequest(settings: unknown) {
  return new Request("https://clipstitchr.test/api/studio/publishing/posts", {
    body: JSON.stringify({
      caption: "The shared post copy",
      destinations: [
        {
          integrationId: "youtube_123",
          provider: "youtube",
          settings,
        },
      ],
      idempotencyKey: "request_123",
      intent: "publish-now",
      media: { kind: "studio-clip-output", recordId: "output_123" },
      mediaRevision,
    }),
    headers: { "content-type": "application/json" },
    method: "POST",
  });
}

describe("readPublishingCreatePostRequest", () => {
  it("accepts strict YouTube settings with an owned thumbnail selection", async () => {
    await expect(
      readPublishingCreatePostRequest(
        createRequest({
          description: "A longer YouTube description",
          madeForKids: false,
          tags: ["product demo", "workflow"],
          thumbnail: {
            media: { kind: "library-media", recordId: "photo_123" },
            mediaRevision,
          },
          title: "A useful video title",
          visibility: "unlisted",
        }),
      ),
    ).resolves.toMatchObject({
      destinations: [
        {
          provider: "youtube",
          settings: {
            thumbnail: {
              media: { kind: "library-media", recordId: "photo_123" },
            },
          },
        },
      ],
    });
  });

  it("rejects duplicate, oversized, and unknown YouTube settings", async () => {
    for (const settings of [
      {
        madeForKids: false,
        tags: ["same", "same"],
        title: "A useful video title",
        visibility: "private",
      },
      {
        madeForKids: false,
        tags: ["x".repeat(499), "another"],
        title: "A useful video title",
        visibility: "private",
      },
      {
        madeForKids: false,
        objectKey: "users/another-user/private.jpg",
        title: "A useful video title",
        visibility: "private",
      },
    ]) {
      await expect(
        readPublishingCreatePostRequest(createRequest(settings)),
      ).rejects.toMatchObject({ code: "invalid_post_request", status: 400 });
    }
  });
});
