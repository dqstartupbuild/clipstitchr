import { afterEach, describe, expect, it, vi } from "vitest";
import { assertStudioBetaProviderWorkerAccess } from "./assertStudioBetaProviderWorkerAccess";

describe("assertStudioBetaProviderWorkerAccess", () => {
  const originalEnabled = process.env.STUDIO_BETA_ENABLED;

  afterEach(() => {
    if (originalEnabled === undefined) {
      delete process.env.STUDIO_BETA_ENABLED;
    } else {
      process.env.STUDIO_BETA_ENABLED = originalEnabled;
    }
  });

  it("does not contact Convex while the worker switch is off", async () => {
    process.env.STUDIO_BETA_ENABLED = "false";
    const client = { mutation: vi.fn() };

    await expect(
      assertStudioBetaProviderWorkerAccess(
        client as never,
        "secret",
        "user_123",
      ),
    ).rejects.toThrow("disabled");
    expect(client.mutation).not.toHaveBeenCalled();
  });

  it("requires the authoritative Convex access assertion", async () => {
    process.env.STUDIO_BETA_ENABLED = "true";
    const client = { mutation: vi.fn().mockResolvedValue(true) };

    await assertStudioBetaProviderWorkerAccess(
      client as never,
      "secret",
      "user_123",
    );

    expect(client.mutation).toHaveBeenCalledWith(expect.anything(), {
      ownerId: "user_123",
      secret: "secret",
    });
  });
});
