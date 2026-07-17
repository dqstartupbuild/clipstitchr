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
      () => new URLSearchParams({ limit: "100" }),
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

function createFullPage(startIndex: number, cursor: string | null) {
  return {
    data: Array.from({ length: 100 }, (_, index) =>
      createPost(`post_${startIndex + index}`),
    ),
    ...(cursor ? { next_cursor: cursor } : {}),
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

  it("requests a single page when the response has no cursor", async () => {
    requestPostBridgeMock.mockResolvedValue({
      data: [createPost("post_1")],
    });

    const posts = await listPostBridgePosts("pb_key");

    expect(requestPostBridgeMock).toHaveBeenCalledOnce();
    expect(posts.map((post) => post.id)).toEqual(["post_1"]);
  });

  it("follows next_cursor until a short page", async () => {
    requestPostBridgeMock
      .mockResolvedValueOnce(createFullPage(0, "cursor_2"))
      .mockResolvedValueOnce({
        data: [createPost("post_100")],
        next_cursor: "cursor_3",
      });

    const posts = await listPostBridgePosts("pb_key");

    expect(requestPostBridgeMock).toHaveBeenCalledTimes(2);
    expect(readQuery(0).get("cursor")).toBeNull();
    expect(readQuery(1).get("cursor")).toBe("cursor_2");
    expect(posts).toHaveLength(101);
  });

  it("supports camelCase cursor fields", async () => {
    requestPostBridgeMock
      .mockResolvedValueOnce({
        data: Array.from({ length: 100 }, (_, index) =>
          createPost(`post_${index}`),
        ),
        nextCursor: "cursor_2",
      })
      .mockResolvedValueOnce({ data: [] });

    const posts = await listPostBridgePosts("pb_key");

    expect(requestPostBridgeMock).toHaveBeenCalledTimes(2);
    expect(readQuery(1).get("cursor")).toBe("cursor_2");
    expect(posts).toHaveLength(100);
  });

  it("stops when the cursor repeats", async () => {
    requestPostBridgeMock.mockResolvedValue(createFullPage(0, "cursor_1"));

    const posts = await listPostBridgePosts("pb_key");

    expect(requestPostBridgeMock).toHaveBeenCalledTimes(2);
    expect(posts).toHaveLength(100);
  });

  it("stops when a page only contains duplicate posts", async () => {
    requestPostBridgeMock
      .mockResolvedValueOnce({
        data: [createPost("post_1")],
        next_cursor: "cursor_2",
      })
      .mockResolvedValueOnce({
        data: [createPost("post_1")],
        next_cursor: "cursor_3",
      });

    const posts = await listPostBridgePosts("pb_key");

    expect(requestPostBridgeMock).toHaveBeenCalledTimes(2);
    expect(posts.map((post) => post.id)).toEqual(["post_1"]);
  });

  it("caps pagination at five pages", async () => {
    requestPostBridgeMock.mockImplementation(async (_path, options) => {
      const cursor = options?.query?.get("cursor");
      const pageIndex = cursor ? Number(cursor.split("_")[1]) : 0;

      return createFullPage(pageIndex * 100, `cursor_${pageIndex + 1}`);
    });

    const posts = await listPostBridgePosts("pb_key");

    expect(requestPostBridgeMock).toHaveBeenCalledTimes(5);
    expect(posts).toHaveLength(500);
  });
});
