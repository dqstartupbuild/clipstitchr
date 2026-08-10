import { beforeEach, describe, expect, it, vi } from "vitest";
import { listSocialPublishingPosts } from "@/lib/clipstitchr/server/socialPublishing/listSocialPublishingPosts";
import { requestSocialPublishing } from "@/lib/clipstitchr/server/socialPublishing/requestSocialPublishing";

vi.mock("@/lib/clipstitchr/server/socialPublishing/requestSocialPublishing", () => ({
  requestSocialPublishing: vi.fn(),
}));

const requestSocialPublishingMock = vi.mocked(requestSocialPublishing);

function createPost(id: string) {
  return {
    _id: id,
    content: "Post " + id,
    createdAt: "2026-07-01T00:00:00.000Z",
    platforms: [{ accountId: "account_1" }],
    status: "scheduled",
    updatedAt: "2026-07-01T00:00:00.000Z",
  };
}

function readQuery(callIndex: number) {
  return requestSocialPublishingMock.mock.calls[callIndex]?.[1]
    ?.query as URLSearchParams;
}

describe("listSocialPublishingPosts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads and normalizes one Zernio page", async () => {
    requestSocialPublishingMock.mockResolvedValue({
      pagination: { pages: 1 },
      posts: [createPost("post_1")],
    });

    const posts = await listSocialPublishingPosts("zernio_key");

    expect(requestSocialPublishingMock).toHaveBeenCalledOnce();
    expect(readQuery(0).get("page")).toBe("1");
    expect(readQuery(0).get("limit")).toBe("100");
    expect(readQuery(0).get("source")).toBe("zernio");
    expect(posts).toEqual([
      expect.objectContaining({
        caption: "Post post_1",
        id: "post_1",
        social_accounts: ["account_1"],
        status: "scheduled",
      }),
    ]);
  });

  it("loads every declared Zernio page and deduplicates posts", async () => {
    requestSocialPublishingMock
      .mockResolvedValueOnce({
        pagination: { pages: 2 },
        posts: [createPost("post_1")],
      })
      .mockResolvedValueOnce({
        pagination: { pages: 2 },
        posts: [createPost("post_1"), createPost("post_2")],
      });

    const posts = await listSocialPublishingPosts("zernio_key");

    expect(requestSocialPublishingMock).toHaveBeenCalledTimes(2);
    expect(readQuery(1).get("page")).toBe("2");
    expect(posts.map((post) => post.id)).toEqual(["post_1", "post_2"]);
  });
});

