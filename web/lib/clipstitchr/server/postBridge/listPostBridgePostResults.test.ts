import { beforeEach, describe, expect, it, vi } from "vitest";
import { listPostBridgePostResults } from "@/lib/clipstitchr/server/postBridge/listPostBridgePostResults";
import { requestPostBridge } from "@/lib/clipstitchr/server/postBridge/requestPostBridge";
import type { PostBridgePostResult } from "@/lib/clipstitchr/types/PostBridgePostResult";

vi.mock("@/lib/clipstitchr/server/postBridge/requestPostBridge", () => ({
  requestPostBridge: vi.fn(),
}));

const requestPostBridgeMock = vi.mocked(requestPostBridge);

function createPostResult(id: string, postId = `post_${id}`): PostBridgePostResult {
  return {
    error: null,
    id,
    platform_data: null,
    post_id: postId,
    social_account_id: 1,
    success: true,
  };
}

function readQuery(callIndex: number) {
  return requestPostBridgeMock.mock.calls[callIndex]?.[1]
    ?.query as URLSearchParams;
}

describe("listPostBridgePostResults", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns no results without requesting when there are no post ids", async () => {
    const results = await listPostBridgePostResults("pb_key", []);

    expect(results).toEqual([]);
    expect(requestPostBridgeMock).not.toHaveBeenCalled();
  });

  it("requests a single chunk for up to 100 unique post ids", async () => {
    requestPostBridgeMock.mockResolvedValue({
      data: [createPostResult("result_1")],
    });

    const results = await listPostBridgePostResults("pb_key", [
      "post_1",
      "post_1",
      " post_2 ",
    ]);

    expect(requestPostBridgeMock).toHaveBeenCalledOnce();
    expect(requestPostBridgeMock).toHaveBeenCalledWith("/v1/post-results", {
      apiKey: "pb_key",
      query: expect.any(URLSearchParams),
    });
    expect(readQuery(0).getAll("post_id")).toEqual(["post_1", "post_2"]);
    expect(results).toEqual([createPostResult("result_1")]);
  });

  it("chunks post ids into groups of 100 and dedupes results by id", async () => {
    const postIds = Array.from({ length: 150 }, (_, index) => `post_${index}`);

    requestPostBridgeMock
      .mockResolvedValueOnce({
        data: [createPostResult("result_1"), createPostResult("result_2")],
      })
      .mockResolvedValueOnce({
        data: [createPostResult("result_2"), createPostResult("result_3")],
      });

    const results = await listPostBridgePostResults("pb_key", postIds);

    expect(requestPostBridgeMock).toHaveBeenCalledTimes(2);
    expect(readQuery(0).getAll("post_id")).toHaveLength(100);
    expect(readQuery(1).getAll("post_id")).toHaveLength(50);
    expect(results.map((result) => result.id)).toEqual([
      "result_1",
      "result_2",
      "result_3",
    ]);
  });
});
