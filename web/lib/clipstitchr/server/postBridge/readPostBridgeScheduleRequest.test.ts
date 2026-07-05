import { describe, expect, it } from "vitest";
import { readPostBridgeScheduleRequest } from "@/lib/clipstitchr/server/postBridge/readPostBridgeScheduleRequest";

function createScheduleRequest(body: object) {
  return new Request("https://clipstitchr.test/api/post-bridge/schedule", {
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });
}

describe("readPostBridgeScheduleRequest", () => {
  it("accepts queue scheduling without a scheduledAt value", async () => {
    await expect(
      readPostBridgeScheduleRequest(
        createScheduleRequest({
          caption: "Launch",
          hasAudio: false,
          mediaFiles: [
            {
              mediaId: "media_1",
              mimeType: "video/mp4",
              name: "launch.mp4",
              sizeBytes: 1024,
            },
          ],
          socialAccountIds: [1],
          sourceId: "swipe_1",
          sourceType: "swipe",
          title: "Launch Swipe",
          useQueue: true,
        }),
      ),
    ).resolves.toMatchObject({
      scheduledAt: null,
      useQueue: true,
    });
  });

  it("rejects queue scheduling with a scheduledAt value", async () => {
    await expect(
      readPostBridgeScheduleRequest(
        createScheduleRequest({
          caption: "Launch",
          mediaFiles: [
            {
              mediaId: "media_1",
              mimeType: "video/mp4",
              name: "launch.mp4",
              sizeBytes: 1024,
            },
          ],
          scheduledAt: "2026-06-27T12:00:00.000Z",
          sourceId: "swipe_1",
          sourceType: "swipe",
          title: "Launch Swipe",
          useQueue: true,
        }),
      ),
    ).rejects.toThrow("Use either the queue or a custom post time, not both.");
  });
});
