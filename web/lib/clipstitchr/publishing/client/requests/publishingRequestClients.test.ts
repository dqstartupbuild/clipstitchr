import { afterEach, describe, expect, it, vi } from "vitest";
import { checkPublishingMediaCompatibility } from "@/lib/clipstitchr/publishing/client/requests/checkPublishingMediaCompatibility";
import { getPublishingPosts } from "@/lib/clipstitchr/publishing/client/requests/getPublishingPosts";

describe("publishing request clients", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("requests a bounded status view with same-origin credentials", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ posts: [] })),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(getPublishingPosts("failed")).resolves.toEqual({ posts: [] });
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/publishing/posts?status=failed",
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
});
