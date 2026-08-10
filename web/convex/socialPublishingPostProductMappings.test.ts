import { describe, expect, it, vi } from "vitest";
import { upsertSocialPublishingPostProductMapping } from "./socialPublishingPostProductMappings";

function createQueryChain(existingMapping: unknown = null) {
  const indexQuery = {
    eq: vi.fn(() => indexQuery),
  };
  const chain = {
    unique: vi.fn(async () => existingMapping),
    withIndex: vi.fn(
      (_indexName: string, callback: (q: typeof indexQuery) => unknown) => {
        callback(indexQuery);

        return chain;
      },
    ),
  };

  return chain;
}

function createCtx(existingMapping: unknown = null) {
  return {
    db: {
      insert: vi.fn(async () => "mapping_doc_1"),
      patch: vi.fn(async () => undefined),
      query: vi.fn(() => createQueryChain(existingMapping)),
    },
  };
}

describe("upsertSocialPublishingPostProductMapping", () => {
  it("inserts a product mapping for a scheduled post", async () => {
    const ctx = createCtx();

    await upsertSocialPublishingPostProductMapping(ctx as never, {
      ownerId: "user_123",
      post: { postId: "post_1" },
      productId: " product_1 ",
      sourceId: "stitch_1",
      sourceType: "stitch",
    });

    expect(ctx.db.insert).toHaveBeenCalledWith(
      "socialPublishingPostProductMappings",
      expect.objectContaining({
        ownerId: "user_123",
        postId: "post_1",
        productId: "product_1",
        sourceId: "stitch_1",
        sourceType: "stitch",
      }),
    );
  });

  it("updates an existing post mapping", async () => {
    const ctx = createCtx({ _id: "mapping_doc_1" });

    await upsertSocialPublishingPostProductMapping(ctx as never, {
      ownerId: "user_123",
      post: { postId: "post_1" },
      productId: "product_2",
      sourceId: "swipe_1",
      sourceType: "swipe",
    });

    expect(ctx.db.patch).toHaveBeenCalledWith(
      "mapping_doc_1",
      expect.objectContaining({
        productId: "product_2",
        sourceId: "swipe_1",
        sourceType: "swipe",
      }),
    );
    expect(ctx.db.insert).not.toHaveBeenCalled();
  });

  it("skips posts without a product", async () => {
    const ctx = createCtx();

    await upsertSocialPublishingPostProductMapping(ctx as never, {
      ownerId: "user_123",
      post: { postId: "post_1" },
      productId: "",
      sourceId: "stitch_1",
      sourceType: "stitch",
    });

    expect(ctx.db.query).not.toHaveBeenCalled();
    expect(ctx.db.insert).not.toHaveBeenCalled();
  });
});
