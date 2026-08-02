import { beforeEach, describe, expect, it, vi } from "vitest";
import { listPostBridgePosts } from "@/lib/clipstitchr/server/postBridge/listPostBridgePosts";
import { requestPostBridge } from "@/lib/clipstitchr/server/postBridge/requestPostBridge";
import type { PostBridgePost } from "@/lib/clipstitchr/types/PostBridgePost";

vi.mock("@/lib/clipstitchr/server/postBridge/requestPostBridge", () => ({
  requestPostBridge: vi.fn(),
}));

vi.mock(
  "@/lib/clipstitchr/server/postBridge/createSupportedPostBridgePlatformQuery",
  () => ({
    createSupportedPostBridgePlatformQuery: vi.fn(
      () => new URLSearchParams({ limit: "100", platform: "tiktok" }),
    ),
  }),
);

const requestPostBridgeMock = vi.mocked(requestPostBridge);

function createPost(id: string): PostBridgePost {
  return {
    caption: `Post ${id}`,
    created_at: "2026-07-01T00:00:00.000Z",
    id,
    is_draft: false,
    scheduled_at: null,
    social_accounts: [1],
    status: "scheduled",
    updated_at: "2026-07-01T00:00:00.000Z",
  };
}

function createPage(startIndex: number, length: number, total: number) {
  return {
    data: Array.from({ length }, (_, index) =>
      createPost(`post_${startIndex + index}`),
    ),
    meta: {
      limit: 100,
      next:
        startIndex + length < total
          ? `/v1/posts?offset=${startIndex + length}&limit=100`
          : null,
      offset: startIndex,
      total,
    },
  };
}

function readQuery(callIndex: number) {
  return requestPostBridgeMock.mock.calls[callIndex]?.[1]
    ?.query as URLSearchParams;
}

describe("listPostBridgePosts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("requests a single offset page when all posts fit", async () => {
    requestPostBridgeMock.mockResolvedValue(createPage(0, 1, 1));

    const posts = await listPostBridgePosts("pb_key");

    expect(requestPostBridgeMock).toHaveBeenCalledOnce();
    expect(readQuery(0).get("offset")).toBe("0");
    expect(readQuery(0).get("limit")).toBe("100");
    expect(readQuery(0).getAll("platform")).toEqual(["tiktok"]);
    expect(posts.map((post) => post.id)).toEqual(["post_0"]);
  });

  it("loads every offset page without a fixed post cap", async () => {
    requestPostBridgeMock.mockImplementation(async (_path, options) => {
      const offset = Number(options?.query?.get("offset") ?? 0);
      const total = 601;

      return createPage(offset, Math.min(100, total - offset), total);
    });

    const posts = await listPostBridgePosts("pb_key");

    expect(requestPostBridgeMock).toHaveBeenCalledTimes(7);
    expect(readQuery(5).get("offset")).toBe("500");
    expect(readQuery(6).get("offset")).toBe("600");
    expect(posts).toHaveLength(601);
    expect(posts.at(-1)?.id).toBe("post_600");
  });

  it("dedupes overlapping posts and stops if a page makes no progress", async () => {
    requestPostBridgeMock
      .mockResolvedValueOnce(createPage(0, 100, 300))
      .mockResolvedValueOnce({
        ...createPage(0, 100, 300),
        meta: { limit: 100, next: null, offset: 100, total: 300 },
      });

    const posts = await listPostBridgePosts("pb_key");

    expect(requestPostBridgeMock).toHaveBeenCalledTimes(2);
    expect(posts).toHaveLength(100);
  });
});
