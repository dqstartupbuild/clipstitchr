import type { ConvexHttpClient } from "convex/browser";
import { describe, expect, it, vi } from "vitest";
import { getCliprProviderJobSnapshot } from "./getCliprProviderJobSnapshot";

describe("getCliprProviderJobSnapshot", () => {
  it("loads the persisted Clipr provider stages for an authorized owner", async () => {
    const snapshot = {
      avatarImageProviderPredictionId: "avatar-image-prediction",
      avatarVideoProviderPredictionId: "avatar-video-prediction",
      providerModels: ["text-model", "avatar-model"],
      scenePlan: [],
      script: "Persisted script",
    };
    const query = vi.fn().mockResolvedValue(snapshot);

    await expect(
      getCliprProviderJobSnapshot(
        { query } as unknown as ConvexHttpClient,
        "provider-secret",
        "owner-123",
        "job-456",
      ),
    ).resolves.toEqual(snapshot);

    expect(query).toHaveBeenCalledTimes(1);
    expect(query.mock.calls[0]?.[1]).toEqual({
      id: "job-456",
      ownerId: "owner-123",
      secret: "provider-secret",
    });
  });
});
