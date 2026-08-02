import { describe, expect, it } from "vitest";
import { PublishingApiError } from "@/lib/clipstitchr/publishing/client/PublishingApiError";
import { publishingApiSchemas } from "@/lib/clipstitchr/publishing/client/readers/publishingApiSchemas";
import { readPublishingApiResponse } from "@/lib/clipstitchr/publishing/client/readers/readPublishingApiResponse";

describe("readPublishingApiResponse", () => {
  it("accepts only the strict integrations response contract", async () => {
    const body = {
      providers: [
        {
          canConnect: true,
          integrations: [],
          provider: "instagram",
          unavailableReason: null,
        },
        {
          canConnect: false,
          integrations: [],
          provider: "tiktok",
          unavailableReason: "TikTok setup is not available.",
        },
      ],
    };

    await expect(
      readPublishingApiResponse(
        new Response(JSON.stringify(body)),
        publishingApiSchemas.integrationsResponse,
      ),
    ).resolves.toEqual(body);
    await expect(
      readPublishingApiResponse(
        new Response(JSON.stringify({ ...body, unverified: true })),
        publishingApiSchemas.integrationsResponse,
      ),
    ).rejects.toMatchObject({ code: "invalid_response" });
  });

  it("preserves bounded 429 retry timing", async () => {
    const response = new Response(
      JSON.stringify({
        code: "publishing_rate_limited",
        message: "Too many publishing requests.",
      }),
      {
        headers: { "Retry-After": "8" },
        status: 429,
      },
    );

    await expect(
      readPublishingApiResponse(
        response,
        publishingApiSchemas.postsResponse,
      ),
    ).rejects.toEqual(
      expect.objectContaining<Partial<PublishingApiError>>({
        code: "publishing_rate_limited",
        retryAfterSeconds: 8,
        status: 429,
      }),
    );
  });

  it("rejects oversized and unreadable response bodies", async () => {
    await expect(
      readPublishingApiResponse(
        new Response("x".repeat(1_048_577)),
        publishingApiSchemas.postsResponse,
      ),
    ).rejects.toMatchObject({ code: "response_too_large" });
    await expect(
      readPublishingApiResponse(
        new Response("not-json"),
        publishingApiSchemas.postsResponse,
      ),
    ).rejects.toMatchObject({ code: "invalid_response" });
  });

  it("rejects a parseable date that is not an explicit ISO instant", async () => {
    await expect(
      readPublishingApiResponse(
        new Response(
          JSON.stringify({
            from: "2026-08-02",
            posts: [],
            timeZone: "America/Detroit",
            to: "2026-08-09T04:00:00.000Z",
          }),
        ),
        publishingApiSchemas.calendarResponse,
      ),
    ).rejects.toMatchObject({ code: "invalid_response" });
  });
});
