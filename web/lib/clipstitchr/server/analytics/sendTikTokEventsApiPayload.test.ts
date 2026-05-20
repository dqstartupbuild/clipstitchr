import { afterEach, describe, expect, it, vi } from "vitest";
import { sendTikTokEventsApiPayload } from "@/lib/clipstitchr/server/analytics/sendTikTokEventsApiPayload";
import { tiktokEventsApiEndpoint } from "@/lib/clipstitchr/server/analytics/tiktokEventsApiEndpoint";

describe("sendTikTokEventsApiPayload", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("posts payloads to TikTok and returns the response body", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        text: vi.fn(async () => JSON.stringify({ code: 0, request_id: "req_1" })),
      })),
    );

    await expect(
      sendTikTokEventsApiPayload({
        accessToken: "token",
        payload: { event_source: "web", event_source_id: "pixel", data: [] },
      }),
    ).resolves.toEqual({ code: 0, request_id: "req_1" });
    expect(fetch).toHaveBeenCalledWith(
      tiktokEventsApiEndpoint,
      expect.objectContaining({
        body: JSON.stringify({
          event_source: "web",
          event_source_id: "pixel",
          data: [],
        }),
        cache: "no-store",
        headers: {
          "Access-Token": "token",
          "Content-Type": "application/json",
        },
        method: "POST",
      }),
    );
  });

  it("throws useful errors for HTTP and nonzero TikTok response codes", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: false,
        text: vi.fn(async () =>
          JSON.stringify({
            code: 40001,
            message: "Bad payload",
            request_id: "req_bad",
          }),
        ),
      })),
    );

    await expect(
      sendTikTokEventsApiPayload({
        accessToken: "token",
        payload: { event_source: "web", event_source_id: "pixel", data: [] },
      }),
    ).rejects.toThrow(
      "TikTok Events API request failed. Code: 40001. Message: Bad payload. Request ID: req_bad.",
    );

    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: false,
        text: vi.fn(async () => "provider down"),
      })),
    );

    await expect(
      sendTikTokEventsApiPayload({
        accessToken: "token",
        payload: { event_source: "web", event_source_id: "pixel", data: [] },
      }),
    ).rejects.toThrow("TikTok Events API request failed.");
  });
});
