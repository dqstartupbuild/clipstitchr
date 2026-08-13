import { beforeEach, describe, expect, it, vi } from "vitest";
import { assertStudioBetaPageAccess } from "./assertStudioBetaPageAccess";

vi.mock("server-only", () => ({}));

const mocks = vi.hoisted(() => ({
  getState: vi.fn(),
  notFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));

vi.mock("next/navigation", () => ({ notFound: mocks.notFound }));
vi.mock("./getStudioBetaServerAccessState", () => ({
  getStudioBetaServerAccessState: mocks.getState,
}));

describe("assertStudioBetaPageAccess", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns a non-disclosing not-found result for route guessing", async () => {
    mocks.getState.mockResolvedValue({
      hasAccess: false,
      isAuthenticated: true,
      userId: "user_123",
    });

    await expect(assertStudioBetaPageAccess()).rejects.toThrow(
      "NEXT_NOT_FOUND",
    );
    expect(mocks.notFound).toHaveBeenCalledOnce();
  });

  it("returns the owner after all gates pass", async () => {
    mocks.getState.mockResolvedValue({
      hasAccess: true,
      isAuthenticated: true,
      userId: "user_123",
    });

    await expect(assertStudioBetaPageAccess()).resolves.toEqual({
      userId: "user_123",
    });
    expect(mocks.notFound).not.toHaveBeenCalled();
  });
});
