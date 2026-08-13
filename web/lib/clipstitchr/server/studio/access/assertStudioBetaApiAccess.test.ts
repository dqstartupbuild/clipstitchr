import { beforeEach, describe, expect, it, vi } from "vitest";
import { assertStudioBetaApiAccess } from "./assertStudioBetaApiAccess";

vi.mock("server-only", () => ({}));

const mocks = vi.hoisted(() => ({ getState: vi.fn() }));

vi.mock("./getStudioBetaServerAccessState", () => ({
  getStudioBetaServerAccessState: mocks.getState,
}));

describe("assertStudioBetaApiAccess", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 semantics for an unauthenticated request", async () => {
    mocks.getState.mockResolvedValue({
      hasAccess: false,
      isAuthenticated: false,
      userId: null,
    });

    await expect(assertStudioBetaApiAccess()).rejects.toMatchObject({
      status: 401,
    });
  });

  it("returns 403 semantics for an authenticated ineligible request", async () => {
    mocks.getState.mockResolvedValue({
      hasAccess: false,
      isAuthenticated: true,
      userId: "user_123",
    });

    await expect(assertStudioBetaApiAccess()).rejects.toMatchObject({
      status: 403,
    });
  });

  it("returns the owner only after access is verified", async () => {
    mocks.getState.mockResolvedValue({
      hasAccess: true,
      isAuthenticated: true,
      userId: "user_123",
    });

    await expect(assertStudioBetaApiAccess()).resolves.toEqual({
      userId: "user_123",
    });
  });
});
