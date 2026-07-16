import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

const mocks = vi.hoisted(() => ({
  getAuthenticatedUserId: vi.fn(),
}));

vi.mock("@/lib/clipstitchr/server/getAuthenticatedUserId", () => ({
  getAuthenticatedUserId: mocks.getAuthenticatedUserId,
}));

describe("POST /api/swapr/jobs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getAuthenticatedUserId.mockResolvedValue("owner_123");
  });

  it("requires authentication", async () => {
    mocks.getAuthenticatedUserId.mockResolvedValue(null);

    const response = await POST();

    expect(response.status).toBe(401);
  });

  it("retires the direct provider route in favor of queued generations", async () => {
    const response = await POST();

    expect(response.status).toBe(410);
    await expect(response.json()).resolves.toEqual({
      message:
        "This older Swapr route has moved. Start Swapr from the dashboard so your plan allowance and queue priority are applied.",
    });
  });
});
