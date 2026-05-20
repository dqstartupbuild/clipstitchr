import { describe, expect, it } from "vitest";
import { readTikTokEventsApiRequest } from "@/lib/clipstitchr/server/analytics/readTikTokEventsApiRequest";

function createRequest(body: unknown) {
  return new Request("https://clipstitchr.test/api/analytics/tiktok/events", {
    body: JSON.stringify(body),
    method: "POST",
  });
}

describe("readTikTokEventsApiRequest", () => {
  it("normalizes a supported TikTok event request", async () => {
    await expect(
      readTikTokEventsApiRequest(
        createRequest({
          event: " ViewContent ",
          eventId: " event_123 ",
          eventTime: 1770000000,
          page: {
            referrer: " https://example.com/ref ",
            url: " https://clipstitchr.com/page ",
          },
          payload: {
            content_id: "clipstitchr",
          },
          user: {
            email: " user@example.com ",
            externalId: " user_123 ",
            phoneNumber: " +15555555555 ",
          },
        }),
      ),
    ).resolves.toEqual({
      event: "ViewContent",
      eventId: "event_123",
      eventTime: 1770000000,
      page: {
        referrer: "https://example.com/ref",
        url: "https://clipstitchr.com/page",
      },
      payload: {
        content_id: "clipstitchr",
      },
      user: {
        email: "user@example.com",
        externalId: "user_123",
        phoneNumber: "+15555555555",
      },
    });
  });

  it("drops invalid optional objects and non-finite event time", async () => {
    await expect(
      readTikTokEventsApiRequest(
        createRequest({
          event: "Lead",
          eventId: "event_123",
          eventTime: Number.NaN,
          page: "not-page",
          payload: "not-payload",
          user: ["not-user"],
        }),
      ),
    ).resolves.toEqual({
      event: "Lead",
      eventId: "event_123",
      eventTime: undefined,
      page: undefined,
      payload: undefined,
      user: undefined,
    });
  });

  it("rejects malformed and unsupported requests", async () => {
    await expect(readTikTokEventsApiRequest(createRequest([]))).rejects.toThrow(
      "Invalid TikTok Events API request.",
    );

    await expect(
      readTikTokEventsApiRequest(
        createRequest({
          event: "UnsupportedEvent",
          eventId: "event_123",
        }),
      ),
    ).rejects.toThrow("Unsupported TikTok event.");

    await expect(
      readTikTokEventsApiRequest(
        createRequest({
          event: "Purchase",
          eventId: " ",
        }),
      ),
    ).rejects.toThrow("Missing TikTok event ID.");
  });
});
