import { afterEach, describe, expect, it, vi } from "vitest";
import { assertStudioBetaMediaWorkerAccess } from "./assertStudioBetaMediaWorkerAccess.mjs";

describe("assertStudioBetaMediaWorkerAccess", () => {
  const originalEnabled = process.env.STUDIO_BETA_ENABLED;

  afterEach(() => {
    if (originalEnabled === undefined) {
      delete process.env.STUDIO_BETA_ENABLED;
    } else {
      process.env.STUDIO_BETA_ENABLED = originalEnabled;
    }
  });

  it("fails before claiming beta work when the switch is off", async () => {
    process.env.STUDIO_BETA_ENABLED = "0";
    const client = { mutation: vi.fn() };

    await expect(
      assertStudioBetaMediaWorkerAccess(client, "secret", "user_123"),
    ).rejects.toThrow("disabled");
    expect(client.mutation).not.toHaveBeenCalled();
  });

  it("rechecks all access gates in Convex when enabled", async () => {
    process.env.STUDIO_BETA_ENABLED = "true";
    const client = { mutation: vi.fn().mockResolvedValue(true) };

    await assertStudioBetaMediaWorkerAccess(
      client,
      "media-secret",
      "user_123",
    );

    expect(client.mutation).toHaveBeenCalledWith(expect.anything(), {
      ownerId: "user_123",
      secret: "media-secret",
    });
  });
});
