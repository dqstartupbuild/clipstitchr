import { beforeEach, describe, expect, it, vi } from "vitest";
import { createPostBridgeDefaultAccountResolver } from "@/lib/clipstitchr/client/createPostBridgeDefaultAccountResolver";

const mocks = vi.hoisted(() => ({
  fetchPostBridgeAccountOptions: vi.fn(),
}));

vi.mock("@/lib/clipstitchr/client/fetchPostBridgeAccountOptions", () => ({
  fetchPostBridgeAccountOptions: mocks.fetchPostBridgeAccountOptions,
}));

describe("createPostBridgeDefaultAccountResolver", () => {
  beforeEach(() => {
    mocks.fetchPostBridgeAccountOptions.mockReset();
  });

  it("returns product default account ids and platforms", async () => {
    mocks.fetchPostBridgeAccountOptions.mockResolvedValue({
      accounts: [
        { id: 10, platform: "tiktok", username: "demo" },
        { id: 20, platform: "youtube", username: "demo" },
      ],
      defaultSocialAccountIds: [20],
    });

    const resolveAccounts = createPostBridgeDefaultAccountResolver();

    await expect(resolveAccounts("product_1")).resolves.toEqual({
      platforms: ["youtube"],
      socialAccountIds: [20],
    });
    await expect(resolveAccounts("product_1")).resolves.toEqual({
      platforms: ["youtube"],
      socialAccountIds: [20],
    });

    expect(mocks.fetchPostBridgeAccountOptions).toHaveBeenCalledOnce();
    expect(mocks.fetchPostBridgeAccountOptions).toHaveBeenCalledWith("product_1");
  });

  it("rejects products without default accounts", async () => {
    mocks.fetchPostBridgeAccountOptions.mockResolvedValue({
      accounts: [],
      defaultSocialAccountIds: [],
    });

    const resolveAccounts = createPostBridgeDefaultAccountResolver();

    await expect(resolveAccounts("product_1")).rejects.toThrow(
      "Save Post Bridge accounts for this product before bulk queueing.",
    );
  });
});
