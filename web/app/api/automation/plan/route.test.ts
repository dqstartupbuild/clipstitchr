import { beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "@/convex/_generated/api";
import { POST } from "./route";

const mocks = vi.hoisted(() => ({
  convex: {
    mutation: vi.fn(),
    query: vi.fn(),
  },
  createConvexHttpClient: vi.fn(),
}));

vi.mock("@/lib/clipstitchr/server/convex/createConvexHttpClient", () => ({
  createConvexHttpClient: mocks.createConvexHttpClient,
}));

function createRequest(body: unknown, secret = "automation_secret") {
  return new Request("http://localhost/api/automation/plan", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-automation-worker-secret": secret,
    },
    body: JSON.stringify(body),
  });
}

describe("POST /api/automation/plan", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.AUTOMATION_WORKER_SECRET = "automation_secret";
    mocks.createConvexHttpClient.mockReturnValue(mocks.convex);
    mocks.convex.mutation.mockResolvedValue({ status: "running", taskIds: [] });
    mocks.convex.query.mockImplementation((_fn, args) => {
      if (args && "ownerId" in args) {
        return Promise.resolve({
          ownerId: "owner_123",
          enabledTools: ["stitchr", "clipr", "swipr"],
        });
      }

      return Promise.resolve({
        preferences: [
          { ownerId: "owner_1", enabledTools: ["stitchr", "clipr", "swipr"] },
        ],
      });
    });
  });

  it("rejects unauthorized planner requests", async () => {
    const response = await POST(createRequest({}, "wrong"));

    expect(response.status).toBe(401);
    expect(mocks.createConvexHttpClient).not.toHaveBeenCalled();
  });

  it("plans active core automation tools for a requested owner", async () => {
    const response = await POST(
      createRequest({
        ownerId: "owner_123",
        now: "2026-05-31T10:00:00.000Z",
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.ownerCount).toBe(1);
    expect(body.plannedTools).toEqual(["stitchr", "clipr", "swipr"]);
    expect(body.heldTools).toEqual([]);
    expect(mocks.convex.query.mock.calls[0]?.[1]).toEqual({
      secret: "automation_secret",
      ownerId: "owner_123",
    });
    expect(mocks.convex.mutation.mock.calls.map((call) => call[1])).toEqual([
      expect.objectContaining({ ownerId: "owner_123" }),
      expect.objectContaining({ ownerId: "owner_123" }),
      expect.objectContaining({ ownerId: "owner_123" }),
    ]);
    expect(mocks.convex.mutation).toHaveBeenCalledTimes(3);
  });

  it("loads enabled planner candidates when no owner is specified", async () => {
    const response = await POST(
      createRequest({
        limit: 25,
        now: "2026-05-31T10:00:00.000Z",
      }),
    );

    expect(response.status).toBe(200);
    expect(mocks.convex.query).toHaveBeenCalledWith(
      api.automationPlannerCandidates.listEnabled,
      {
        secret: "automation_secret",
        limit: 25,
      },
    );
  });
});
