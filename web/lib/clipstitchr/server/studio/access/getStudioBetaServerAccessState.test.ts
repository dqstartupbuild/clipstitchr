import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getStudioBetaServerAccessState } from "./getStudioBetaServerAccessState";

vi.mock("server-only", () => ({}));

const mocks = vi.hoisted(() => {
  const convex = { query: vi.fn() };

  return {
    convex,
    createClient: vi.fn(() => convex),
    getDevelopmentBypassStatus: vi.fn(),
    getToken: vi.fn(),
    getUserId: vi.fn(),
  };
});

vi.mock("@/convex/_generated/api", () => ({
  api: {
    studioBetaAccess: {
      getCurrentStudioBetaAccessState: {
        getCurrentStudioBetaAccessState: "get-access-state",
      },
    },
  },
}));
vi.mock(
  "@/lib/clipstitchr/server/convex/createAuthenticatedConvexHttpClient",
  () => ({ createAuthenticatedConvexHttpClient: mocks.createClient }),
);
vi.mock(
  "@/lib/clipstitchr/development/auth/getDevelopmentAuthBypassRequestStatus",
  () => ({
    getDevelopmentAuthBypassRequestStatus: mocks.getDevelopmentBypassStatus,
  }),
);
vi.mock("@/lib/clipstitchr/server/convex/getAuthenticatedConvexToken", () => ({
  getAuthenticatedConvexToken: mocks.getToken,
}));
vi.mock("@/lib/clipstitchr/server/getAuthenticatedUserId", () => ({
  getAuthenticatedUserId: mocks.getUserId,
}));

describe("getStudioBetaServerAccessState", () => {
  const originalEnabled = process.env.STUDIO_BETA_ENABLED;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.STUDIO_BETA_ENABLED = "true";
    mocks.getDevelopmentBypassStatus.mockResolvedValue(false);
    mocks.getUserId.mockResolvedValue("user_123");
    mocks.getToken.mockResolvedValue("convex-token");
    mocks.convex.query.mockResolvedValue({
      hasAccess: true,
      isAllowlisted: true,
      isEnabled: true,
      isGloballyEnabled: true,
    });
  });

  afterEach(() => {
    if (originalEnabled === undefined) {
      delete process.env.STUDIO_BETA_ENABLED;
    } else {
      process.env.STUDIO_BETA_ENABLED = originalEnabled;
    }
  });

  it("distinguishes an unauthenticated request", async () => {
    mocks.getUserId.mockResolvedValue(null);

    await expect(getStudioBetaServerAccessState()).resolves.toMatchObject({
      hasAccess: false,
      isAuthenticated: false,
      userId: null,
    });
    expect(mocks.getToken).not.toHaveBeenCalled();
  });

  it("fails closed before Clerk for development preview requests", async () => {
    mocks.getDevelopmentBypassStatus.mockResolvedValue(true);

    await expect(getStudioBetaServerAccessState()).resolves.toMatchObject({
      hasAccess: false,
      isAuthenticated: false,
      userId: null,
    });
    expect(mocks.getUserId).not.toHaveBeenCalled();
    expect(mocks.getToken).not.toHaveBeenCalled();
  });

  it("fails closed before Convex when the global switch is off", async () => {
    process.env.STUDIO_BETA_ENABLED = "false";

    await expect(getStudioBetaServerAccessState()).resolves.toMatchObject({
      hasAccess: false,
      isAuthenticated: true,
      isGloballyEnabled: false,
      userId: "user_123",
    });
    expect(mocks.getToken).not.toHaveBeenCalled();
  });

  it("returns the authenticated three-gate state", async () => {
    await expect(getStudioBetaServerAccessState()).resolves.toEqual({
      hasAccess: true,
      isAllowlisted: true,
      isAuthenticated: true,
      isEnabled: true,
      isGloballyEnabled: true,
      userId: "user_123",
    });
    expect(mocks.convex.query).toHaveBeenCalledWith("get-access-state", {});
  });

  it("fails closed when Convex cannot verify the grant", async () => {
    mocks.convex.query.mockRejectedValue(new Error("offline"));

    await expect(getStudioBetaServerAccessState()).resolves.toMatchObject({
      hasAccess: false,
      isAuthenticated: true,
      userId: "user_123",
    });
  });
});
