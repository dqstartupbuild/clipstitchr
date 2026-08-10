import { describe, expect, it, vi } from "vitest";
import { clearSocialPublishingSocialAccountIdsForOwner } from "./clearSocialPublishingSocialAccountIdsForOwner";

function createCollectQuery(items: unknown[]) {
  const indexQuery = {
    eq: vi.fn(() => indexQuery),
  };
  const chain = {
    collect: vi.fn(async () => items),
    withIndex: vi.fn(
      (_indexName: string, callback: (q: typeof indexQuery) => void) => {
        callback(indexQuery);

        return chain;
      },
    ),
  };

  return chain;
}

describe("clearSocialPublishingSocialAccountIdsForOwner", () => {
  it("clears stored Zernio account IDs from products and product cards", async () => {
    const productQuery = createCollectQuery([
      {
        _id: "product_doc_1",
        socialPublishingSocialAccountIds: [101, 202],
      },
      {
        _id: "product_doc_2",
      },
      {
        _id: "product_doc_3",
        socialPublishingSocialAccountIds: [],
      },
    ]);
    const productCardQuery = createCollectQuery([
      {
        _id: "product_card_doc_1",
        socialPublishingSocialAccountIds: [303],
      },
      {
        _id: "product_card_doc_2",
      },
    ]);
    const ctx = {
      db: {
        patch: vi.fn(async () => undefined),
        query: vi.fn((tableName: string) =>
          tableName === "products" ? productQuery : productCardQuery,
        ),
      },
    };

    await clearSocialPublishingSocialAccountIdsForOwner(
      ctx as never,
      "owner_123",
      "2026-07-03T12:00:00.000Z",
    );

    expect(ctx.db.query).toHaveBeenCalledWith("products");
    expect(ctx.db.query).toHaveBeenCalledWith("productCards");
    expect(productQuery.withIndex).toHaveBeenCalledWith(
      "by_owner_created",
      expect.any(Function),
    );
    expect(productCardQuery.withIndex).toHaveBeenCalledWith(
      "by_owner_created",
      expect.any(Function),
    );
    expect(ctx.db.patch).toHaveBeenCalledTimes(3);
    expect(ctx.db.patch).toHaveBeenCalledWith("product_doc_1", {
      socialPublishingSocialAccountIds: undefined,
      updatedAt: "2026-07-03T12:00:00.000Z",
    });
    expect(ctx.db.patch).toHaveBeenCalledWith("product_doc_3", {
      socialPublishingSocialAccountIds: undefined,
      updatedAt: "2026-07-03T12:00:00.000Z",
    });
    expect(ctx.db.patch).toHaveBeenCalledWith("product_card_doc_1", {
      socialPublishingSocialAccountIds: undefined,
      updatedAt: "2026-07-03T12:00:00.000Z",
    });
  });
});
