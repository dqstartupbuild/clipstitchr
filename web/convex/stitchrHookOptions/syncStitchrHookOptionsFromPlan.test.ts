import { describe, expect, it, vi } from "vitest";
import { syncStitchrHookOptionsFromPlan } from "./syncStitchrHookOptionsFromPlan";

describe("syncStitchrHookOptionsFromPlan", () => {
  it("resets feedback and Idea linkage when a rank receives new hook wording", async () => {
    const existing = {
      _id: "option_doc",
      createdAt: "2026-07-11T12:00:00.000Z",
      hook: "The old morning shortcut",
      id: "plan_1:option:0",
      linkedIdeaId: "idea_1",
      normalizedHook: "the old morning shortcut",
      rank: 0,
      reviewState: "saved",
      reviewedAt: "2026-07-11T13:00:00.000Z",
    };
    const ctx = {
      db: {
        delete: vi.fn(),
        insert: vi.fn(),
        patch: vi.fn(),
        query: vi.fn(() => {
          const indexQuery = { eq: vi.fn(() => indexQuery) };
          const chain = {
            take: vi.fn(async () => [existing]),
            withIndex: vi.fn(
              (_index: string, callback: (query: typeof indexQuery) => unknown) => {
                callback(indexQuery);
                return chain;
              },
            ),
          };

          return chain;
        }),
      },
    };

    await syncStitchrHookOptionsFromPlan({
      createdAt: "2026-07-12T12:00:00.000Z",
      ctx: ctx as never,
      hookOptions: [
        {
          acceptedAt: "2026-07-12T12:01:00.000Z",
          angle: "Curiosity",
          feedbackStatus: "accepted",
          reason: "A new direction",
          rejectionReason: "Old feedback",
          text: "The new evening shortcut",
        },
      ],
      ownerId: "owner_1",
      planCreatedAt: "2026-07-12T12:00:00.000Z",
      planId: "plan_1",
      planSource: "manual",
      productId: "product_1",
      productName: "Product",
      selectedHook: "The new evening shortcut",
      updatedAt: "2026-07-12T12:02:00.000Z",
    });

    expect(ctx.db.patch).toHaveBeenCalledWith(
      "option_doc",
      expect.objectContaining({
        hook: "The new evening shortcut",
        linkedIdeaId: undefined,
        rejectionReason: undefined,
        reviewState: "needs_review",
        reviewedAt: undefined,
      }),
    );
  });
});
