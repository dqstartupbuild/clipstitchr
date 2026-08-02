import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getPostBridgeCutoverInventory } from "./getPostBridgeCutoverInventory";

type ConvexFunction<Args, Result> = {
  handler: (ctx: unknown, args: Args) => Promise<Result>;
};

const mocks = vi.hoisted(() => ({
  assertRateLimitApiSecret: vi.fn(),
  query: vi.fn((definition) => definition),
}));

vi.mock("../_generated/server", () => ({
  query: mocks.query,
}));

vi.mock("../auth/assertRateLimitApiSecret", () => ({
  assertRateLimitApiSecret: mocks.assertRateLimitApiSecret,
}));

function getHandler<Args, Result>(convexFunction: unknown) {
  return (convexFunction as ConvexFunction<Args, Result>).handler;
}

function createContext() {
  const tables = {
    postBridgePostProductMappings: [{ _id: "mapping_1" }],
    postBridgeSettings: [{ _id: "settings_1" }],
    stitches: [
      {
        postBridgePosts: [
          {
            scheduledAt: "2026-08-03T10:00:00.000Z",
            status: "scheduled",
            updatedAt: "2026-08-01T10:00:00.000Z",
          },
          {
            status: "processing",
            updatedAt: "2026-07-01T10:00:00.000Z",
          },
        ],
      },
    ],
    swipes: [
      {
        postBridgePosts: [
          {
            scheduledAt: "2026-07-01T10:00:00.000Z",
            status: "scheduled",
            updatedAt: "2026-06-01T10:00:00.000Z",
          },
          {
            status: "processing",
            updatedAt: "2026-07-02T10:00:00.000Z",
          },
          {
            status: "posted",
            updatedAt: "2026-07-03T10:00:00.000Z",
          },
        ],
      },
    ],
  };

  return {
    db: {
      query: vi.fn((tableName: keyof typeof tables) => ({
        take: vi.fn(async (limit: number) =>
          tables[tableName].slice(0, limit),
        ),
      })),
    },
  };
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-08-02T04:35:00.000Z"));
  mocks.assertRateLimitApiSecret.mockReset();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("getPostBridgeCutoverInventory", () => {
  it("returns aggregate cutover facts without credential or account data", async () => {
    const result = await getHandler<
      { secret: string },
      Record<string, unknown>
    >(getPostBridgeCutoverInventory)(createContext(), { secret: "operator" });

    expect(mocks.assertRateLimitApiSecret).toHaveBeenCalledWith("operator");
    expect(result).toMatchObject({
      auditedAt: "2026-08-02T04:35:00.000Z",
      earliestFutureSchedule: "2026-08-03T10:00:00.000Z",
      futureScheduledReferences: 1,
      latestFutureSchedule: "2026-08-03T10:00:00.000Z",
      mappingsCount: 1,
      newestProcessingUpdate: "2026-07-02T10:00:00.000Z",
      oldestProcessingUpdate: "2026-07-01T10:00:00.000Z",
      settingsCount: 1,
      statusCounts: {
        failed: 0,
        posted: 1,
        processing: 2,
        scheduled: 2,
      },
      stitchRecordsWithPostBridgeHistory: 1,
      swipeRecordsWithPostBridgeHistory: 1,
      totalPostReferences: 5,
      truncated: false,
    });
    expect(JSON.stringify(result)).not.toContain("operator");
  });
});
