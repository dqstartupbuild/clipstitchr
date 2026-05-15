import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { createTikTokEventPayload } from "@/lib/clipstitchr/analytics/createTikTokEventPayload";
import { createTikTokEventsApiPayload } from "@/lib/clipstitchr/server/analytics/createTikTokEventsApiPayload";

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function createRequest() {
  return new Request("https://clipstitchr.com/api/analytics/tiktok/events", {
    headers: {
      "user-agent": "Vitest browser",
      "x-forwarded-for": "203.0.113.10, 198.51.100.20",
    },
  });
}

describe("createTikTokEventsApiPayload", () => {
  it("creates a server-side TikTok Events API payload", () => {
    const payload = createTikTokEventsApiPayload({
      clientRequest: {
        event: "Lead",
        eventId: "lead-123",
        eventTime: 1_800_000_000,
        page: {
          referrer: "https://example.com/",
          url: "https://clipstitchr.com/sign-up?ttclid=clicked",
        },
        payload: createTikTokEventPayload({
          contentCategory: "Waitlist",
          contentId: "waitlist_signup",
          contentName: "ClipStitchr waitlist",
          contentType: "product_group",
        }),
        user: {
          email: "User@Example.com",
          externalId: "user_123",
        },
      },
      cookieHeader: "_ttp=ttp-cookie",
      pixelId: "PIXEL123",
      request: createRequest(),
      testEventCode: "TEST61771",
    });

    expect(payload).toEqual({
      data: [
        {
          event: "Lead",
          event_id: "lead-123",
          event_time: 1_800_000_000,
          page: {
            referrer: "https://example.com/",
            url: "https://clipstitchr.com/sign-up?ttclid=clicked",
          },
          properties: {
            contents: [
              {
                brand: "ClipStitchr",
                content_category: "Waitlist",
                content_id: "waitlist_signup",
                content_name: "ClipStitchr waitlist",
                content_type: "product_group",
              },
            ],
            currency: "USD",
            value: 0,
          },
          user: {
            email: sha256("user@example.com"),
            external_id: sha256("user_123"),
            ip: "203.0.113.10",
            phone: undefined,
            ttclid: "clicked",
            ttp: "ttp-cookie",
            user_agent: "Vitest browser",
          },
        },
      ],
      event_source: "web",
      event_source_id: "PIXEL123",
      test_event_code: "TEST61771",
    });
  });
});
