import { afterEach, describe, expect, it, vi } from "vitest";
import { createPostBridgePost } from "@/lib/clipstitchr/server/postBridge/createPostBridgePost";

vi.mock("@/lib/clipstitchr/server/postBridge/reservePostBridgeProviderRequest", () => ({
  reservePostBridgeProviderRequest: vi.fn(),
}));

describe("createPostBridgePost", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("uses Post Bridge queue scheduling without scheduled_at", async () => {
    const bodies: object[] = [];

    vi.stubGlobal(
      "fetch",
      vi.fn(async (_url: RequestInfo | URL, init?: RequestInit) => {
        bodies.push(JSON.parse(String(init?.body)) as object);

        return Response.json({
          caption: "Launch",
          created_at: "2026-06-26T00:00:00.000Z",
          id: "post_1",
          is_draft: false,
          scheduled_at: "2026-06-27T12:00:00.000Z",
          social_accounts: [1],
          status: "scheduled",
          updated_at: "2026-06-26T00:00:00.000Z",
        });
      }),
    );

    await createPostBridgePost({
      apiKey: "pb_test_key",
      caption: "Launch",
      mediaIds: ["media_1"],
      platforms: ["tiktok"],
      scheduledAt: null,
      socialAccountIds: [1],
      title: "Launch title",
      useQueue: true,
    });

    expect(bodies[0]).toMatchObject({
      social_accounts: [1],
      use_queue: true,
    });
    expect(bodies[0]).not.toHaveProperty("scheduled_at");
  });

  it("sends scheduled_at for custom scheduled posts", async () => {
    const bodies: object[] = [];

    vi.stubGlobal(
      "fetch",
      vi.fn(async (_url: RequestInfo | URL, init?: RequestInit) => {
        bodies.push(JSON.parse(String(init?.body)) as object);

        return Response.json({
          caption: "Launch",
          created_at: "2026-06-26T00:00:00.000Z",
          id: "post_1",
          is_draft: false,
          scheduled_at: "2026-06-27T12:00:00.000Z",
          social_accounts: [1],
          status: "scheduled",
          updated_at: "2026-06-26T00:00:00.000Z",
        });
      }),
    );

    await createPostBridgePost({
      apiKey: "pb_test_key",
      caption: "Launch",
      mediaIds: ["media_1"],
      platforms: ["tiktok"],
      scheduledAt: "2026-06-27T12:00:00.000Z",
      socialAccountIds: [1],
      title: "Launch title",
      useQueue: false,
    });

    expect(bodies[0]).toMatchObject({
      scheduled_at: "2026-06-27T12:00:00.000Z",
      social_accounts: [1],
    });
    expect(bodies[0]).not.toHaveProperty("use_queue");
  });
});
