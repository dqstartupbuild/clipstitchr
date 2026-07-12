import { beforeEach, describe, expect, it, vi } from "vitest";
import { markGeneratingFromProvider } from "./markGeneratingFromProvider";

type ConvexFunction = {
  handler: (ctx: unknown, args: Record<string, unknown>) => Promise<unknown>;
};

const mocks = vi.hoisted(() => ({
  assertProviderWorkerSecret: vi.fn(),
  mutation: vi.fn((definition) => definition),
}));

vi.mock("../_generated/server", () => ({ mutation: mocks.mutation }));
vi.mock("../auth/assertProviderWorkerSecret", () => ({
  assertProviderWorkerSecret: mocks.assertProviderWorkerSecret,
}));

function getHandler() {
  return (markGeneratingFromProvider as unknown as ConvexFunction).handler;
}

describe("hookLabIdeaVariants.markGeneratingFromProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("atomically refuses wording that overlaps a sibling already reserved", async () => {
    const variant = {
      _id: "variant_doc_2",
      id: "variant_2",
      providerPredictionIds: [],
      useId: "use_1",
    };
    const ctx = {
      db: {
        patch: vi.fn(),
        query: vi.fn((table: string) => {
          const indexQuery = { eq: vi.fn(() => indexQuery) };
          const chain = {
            take: vi.fn(async () => [
              {
                generatedHook: "A calmer morning starts right here",
                id: "variant_1",
              },
              variant,
            ]),
            unique: vi.fn(async () =>
              table === "hookLabIdeaVariants" ? variant : null,
            ),
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

    await expect(
      getHandler()(ctx, {
        generatedCaption: "Caption",
        generatedHook: "A calmer morning starts right here!",
        id: variant.id,
        ownerId: "owner_1",
        providerPredictionIds: ["prediction_2"],
        secret: "provider-secret",
        textDecision: "adapted",
        textDecisionReason: "Adapted for this product.",
        updatedAt: "2026-07-12T12:00:00.000Z",
        visualPrompt: "A candid reaction in a fresh setting.",
        visualPromptSummary: "A candid reaction",
      }),
    ).resolves.toEqual({
      accepted: false,
      id: "variant_2",
      siblingHooks: ["A calmer morning starts right here"],
    });
    expect(ctx.db.patch).not.toHaveBeenCalled();
  });
});
