import { afterEach, describe, expect, it, vi } from "vitest";
import { assertSocialPendingLimits } from "./assertSocialPendingLimits";

const originalPostLimit =
  process.env.SOCIAL_MAX_SCHEDULED_POSTS_PER_OWNER;
const originalTargetLimit =
  process.env.SOCIAL_MAX_PENDING_DELIVERIES_PER_OWNER;

function createContext({
  postsByStatus = {},
  targetsByStatus = {},
}: {
  postsByStatus?: Record<string, unknown[]>;
  targetsByStatus?: Record<string, unknown[]>;
}) {
  return {
    db: {
      query: vi.fn((table: string) => {
        let status = "";
        const index = {
          eq: vi.fn((field: string, value: string) => {
            if (field === "status") {
              status = value;
            }
            return index;
          }),
        };
        const chain = {
          take: vi.fn(async () =>
            table === "socialPosts"
              ? postsByStatus[status] ?? []
              : targetsByStatus[status] ?? [],
          ),
          withIndex: vi.fn(
            (_name: string, callback: (value: typeof index) => void) => {
              callback(index);
              return chain;
            },
          ),
        };

        return chain;
      }),
    },
  };
}

describe("assertSocialPendingLimits", () => {
  afterEach(() => {
    process.env.SOCIAL_MAX_SCHEDULED_POSTS_PER_OWNER = originalPostLimit;
    process.env.SOCIAL_MAX_PENDING_DELIVERIES_PER_OWNER =
      originalTargetLimit;
  });

  it("rejects a new logical post at the pending post limit", async () => {
    process.env.SOCIAL_MAX_SCHEDULED_POSTS_PER_OWNER = "2";
    process.env.SOCIAL_MAX_PENDING_DELIVERIES_PER_OWNER = "10";

    await expect(
      assertSocialPendingLimits(
        createContext({
          postsByStatus: {
            scheduled: [{ id: "post_1" }],
            held: [{ id: "post_2" }],
          },
        }) as never,
        "owner_1",
        1,
      ),
    ).rejects.toThrow("2 social posts waiting");
  });

  it("counts every requested destination against the delivery limit", async () => {
    process.env.SOCIAL_MAX_SCHEDULED_POSTS_PER_OWNER = "10";
    process.env.SOCIAL_MAX_PENDING_DELIVERIES_PER_OWNER = "3";

    await expect(
      assertSocialPendingLimits(
        createContext({
          targetsByStatus: {
            scheduled: [{ id: "target_1" }, { id: "target_2" }],
          },
        }) as never,
        "owner_1",
        2,
      ),
    ).rejects.toThrow("up to 3 social deliveries");
  });
});
