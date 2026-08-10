import { describe, expect, it } from "vitest";
import { readSocialPublishingScheduleRequest } from "@/lib/clipstitchr/server/socialPublishing/readSocialPublishingScheduleRequest";

function createScheduleRequest(body: object) {
  return new Request("https://clipstitchr.test/api/social-publishing/schedule", {
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });
}

describe("readSocialPublishingScheduleRequest", () => {
  it("accepts queue scheduling without a scheduledAt value", async () => {
    await expect(
      readSocialPublishingScheduleRequest(
        createScheduleRequest({
          caption: "Launch",
          hasAudio: false,
          mediaFiles: [
            {
              customPlatform: "instagram",
              mediaId: "media_1",
              mimeType: "video/mp4",
              name: "launch.mp4",
              sizeBytes: 1024,
            },
          ],
          socialAccountIds: ["account_1"],
          sourceId: "swipe_1",
          sourceType: "swipe",
          title: "Launch Swipe",
          useQueue: true,
        }),
      ),
    ).resolves.toMatchObject({
      mediaFiles: [expect.objectContaining({ customPlatform: "instagram" })],
      scheduledAt: null,
      useQueue: true,
    });
  });

  it("rejects queue scheduling with a scheduledAt value", async () => {
    await expect(
      readSocialPublishingScheduleRequest(
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
