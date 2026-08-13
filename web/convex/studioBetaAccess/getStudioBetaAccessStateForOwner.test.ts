import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getStudioBetaAccessStateForOwner } from "./getStudioBetaAccessStateForOwner";

const mocks = vi.hoisted(() => ({
  getGrant: vi.fn(),
  getPreference: vi.fn(),
}));

vi.mock("./getStudioBetaAccessGrantForOwner", () => ({
  getStudioBetaAccessGrantForOwner: mocks.getGrant,
}));
vi.mock("./getStudioBetaPreferenceForOwner", () => ({
  getStudioBetaPreferenceForOwner: mocks.getPreference,
}));

describe("getStudioBetaAccessStateForOwner", () => {
  const originalEnabled = process.env.STUDIO_BETA_ENABLED;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.STUDIO_BETA_ENABLED = "true";
    mocks.getGrant.mockResolvedValue({ status: "active" });
    mocks.getPreference.mockResolvedValue({ enabled: true });
  });

  afterEach(() => {
    if (originalEnabled === undefined) {
      delete process.env.STUDIO_BETA_ENABLED;
    } else {
      process.env.STUDIO_BETA_ENABLED = originalEnabled;
    }
  });

  it("grants access only when all three gates are true", async () => {
    await expect(
      getStudioBetaAccessStateForOwner({} as never, "user_123"),
    ).resolves.toEqual({
      hasAccess: true,
      isAllowlisted: true,
      isEnabled: true,
      isGloballyEnabled: true,
    });
  });

  it("denies an authenticated but unlisted owner", async () => {
    mocks.getGrant.mockResolvedValue(null);

    await expect(
      getStudioBetaAccessStateForOwner({} as never, "user_123"),
    ).resolves.toMatchObject({ hasAccess: false, isAllowlisted: false });
  });

  it("denies an allowlisted owner who has not opted in", async () => {
    mocks.getPreference.mockResolvedValue({ enabled: false });

    await expect(
      getStudioBetaAccessStateForOwner({} as never, "user_123"),
    ).resolves.toMatchObject({ hasAccess: false, isEnabled: false });
  });

  it("denies a revoked owner without deleting the saved preference", async () => {
    mocks.getGrant.mockResolvedValue({ status: "revoked" });

    await expect(
      getStudioBetaAccessStateForOwner({} as never, "user_123"),
    ).resolves.toMatchObject({
      hasAccess: false,
      isAllowlisted: false,
      isEnabled: true,
    });
  });

  it("denies every owner when the global switch is not exactly true", async () => {
    process.env.STUDIO_BETA_ENABLED = "TRUE";

    await expect(
      getStudioBetaAccessStateForOwner({} as never, "user_123"),
    ).resolves.toMatchObject({
      hasAccess: false,
      isGloballyEnabled: false,
    });
  });
});
