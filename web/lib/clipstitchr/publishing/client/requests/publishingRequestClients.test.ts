import { afterEach, describe, expect, it, vi } from "vitest";
import { checkPublishingMediaCompatibility } from "@/lib/clipstitchr/publishing/client/requests/checkPublishingMediaCompatibility";
import { createPublishingPost } from "@/lib/clipstitchr/publishing/client/requests/createPublishingPost";
import { getPublishingAnalytics } from "@/lib/clipstitchr/publishing/client/requests/getPublishingAnalytics";
import { getPublishingPosts } from "@/lib/clipstitchr/publishing/client/requests/getPublishingPosts";
import { refreshPublishingAnalytics } from "@/lib/clipstitchr/publishing/client/requests/refreshPublishingAnalytics";

describe("publishing request clients", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("requests a bounded status view with same-origin credentials", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ posts: [] })),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(getPublishingPosts("failed", "product_1")).resolves.toEqual({
      posts: [],
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/studio/publishing/posts?status=failed",
      expect.objectContaining({
        cache: "no-store",
        credentials: "same-origin",
      }),
    );
  });

  it("rejects compatibility results for a destination that was not requested", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            destinations: [
              {
                integrationId: "integration_other",
                issues: [],
                status: "ready",
              },
            ],
            mediaRevision: "revision-1",
          }),
        ),
      ),
    );

    await expect(
      checkPublishingMediaCompatibility({
        destinations: [
          { integrationId: "integration_1", provider: "instagram" },
        ],
        media: { kind: "swipe", recordId: "swipe_1" },
      }),
    ).rejects.toMatchObject({ code: "invalid_response" });
  });

  it("rejects a post row returned for another Product", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            posts: [
              {
                accountName: "Studio channel",
                caption: "",
                createdAt: "2026-08-02T16:00:00.000Z",
                id: "post_1",
                integrationId: "youtube_1",
                media: { kind: "studio-clip-output", recordId: "clip_1" },
                productId: "product_other",
                provider: "youtube",
                resultUrl: null,
                scheduledAt: null,
                status: "published",
                statusMessage: null,
                timeZone: "America/Detroit",
                updatedAt: "2026-08-02T16:01:00.000Z",
              },
            ],
          }),
        ),
      ),
    );

    await expect(
      getPublishingPosts("all", "product_1"),
    ).rejects.toMatchObject({ code: "invalid_response" });
  });

  it("refreshes analytics with only the browser post identifier", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          metrics: [],
          observedAt: "2026-08-02T16:00:00.000Z",
          postId: "post_1",
        }),
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(refreshPublishingAnalytics("post_1")).resolves.toMatchObject({
      postId: "post_1",
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/studio/publishing/analytics/refresh",
      expect.objectContaining({
        body: JSON.stringify({ postId: "post_1" }),
        method: "POST",
      }),
    );
    expect(fetchMock.mock.calls[0]?.[1]?.body).not.toContain("productId");
  });

  it("rejects analytics rows returned for another Product", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            metrics: [],
            observedAt: "2026-08-02T16:00:00.000Z",
            productId: "product_1",
            publications: [
              {
                accountName: "Studio channel",
                caption: "",
                id: "post_1",
                metrics: [],
                observedAt: "2026-08-02T16:00:00.000Z",
                productId: "product_other",
                provider: "youtube",
                resultUrl: null,
              },
            ],
            range: "7d",
            unsupported: [],
          }),
        ),
      ),
    );

    await expect(
      getPublishingAnalytics("7d", "product_1"),
    ).rejects.toMatchObject({ code: "invalid_response" });
  });

  it("keeps Product identity out of a browser create body and rejects a mismatched response", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          destinations: [
            {
              integrationId: "youtube_1",
              message: null,
              postId: "post_1",
              status: "queued",
            },
          ],
          productId: "product_other",
          requestId: "request_1",
        }),
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      createPublishingPost(
        {
          caption: "Fallback description",
          destinations: [
            {
              integrationId: "youtube_1",
              provider: "youtube",
              settings: {
                madeForKids: false,
                title: "Camera setup",
                visibility: "private",
              },
            },
          ],
          idempotencyKey: "publish_request_1",
          intent: "publish-now",
          media: { kind: "studio-clip-output", recordId: "clip_1" },
          mediaRevision: "a".repeat(64),
        },
        "product_1",
      ),
    ).rejects.toMatchObject({ code: "invalid_response" });
    const browserBody = JSON.parse(
      String(fetchMock.mock.calls[0]?.[1]?.body),
    ) as Record<string, unknown>;
    expect(browserBody).not.toHaveProperty("productId");
  });
});
