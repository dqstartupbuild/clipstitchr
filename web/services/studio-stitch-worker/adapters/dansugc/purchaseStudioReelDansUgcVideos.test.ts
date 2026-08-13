import { describe, expect, it, vi } from "vitest";
import { purchaseStudioReelDansUgcVideos } from "./purchaseStudioReelDansUgcVideos";

const selections = [
  {
    modelId: "model_1",
    price: 3,
    recipeId: "recipe_1",
    source: { kind: "videoClip" as const, videoClipId: "placeholder_1" },
    title: "Reaction",
    videoId: "video_1",
  },
];

describe("purchaseStudioReelDansUgcVideos", () => {
  it("reconciles a lost purchase response before any safe retry", async () => {
    const reserveReconciliation = vi.fn(async () => undefined);
    const request = vi
      .fn<typeof fetch>()
      .mockRejectedValueOnce(new TypeError("connection reset"))
      .mockResolvedValueOnce(
        Response.json({
          purchases: [
            {
              currency: "USD",
              download_url: "https://media.example.test/full/video.mp4",
              price_paid: 3,
              purchased_at: "2026-08-12T00:00:00.000Z",
              video_id: "video_1",
            },
          ],
        }),
      );

    await expect(
      purchaseStudioReelDansUgcVideos({
        apiKey: "dsk_test_key",
        fetch: request,
        purchaseAlreadyReserved: false,
        reserveReconciliation,
        selections,
      }),
    ).resolves.toMatchObject([{ videoId: "video_1", pricePaid: 3 }]);
    expect(reserveReconciliation).toHaveBeenCalledOnce();
    expect(new URL(String(request.mock.calls[1][0])).pathname).toBe(
      "/api/v1/broll/purchases",
    );
  });

  it("never re-posts a reserved purchase when reconciliation is missing", async () => {
    const reserveReconciliation = vi.fn(async () => undefined);
    const request = vi
      .fn<typeof fetch>()
      .mockRejectedValueOnce(new TypeError("connection reset"))
      .mockResolvedValueOnce(Response.json({ purchases: [] }))
      .mockResolvedValueOnce(Response.json({ purchases: [] }));

    await expect(
      purchaseStudioReelDansUgcVideos({
        apiKey: "dsk_test_key",
        fetch: request,
        purchaseAlreadyReserved: false,
        reserveReconciliation,
        selections,
      }),
    ).rejects.toMatchObject({
      code: "DANSUGC_PURCHASE_OUTCOME_UNCERTAIN",
      kind: "uncertain",
    });

    await expect(
      purchaseStudioReelDansUgcVideos({
        apiKey: "dsk_test_key",
        fetch: request,
        purchaseAlreadyReserved: true,
        reserveReconciliation,
        selections,
      }),
    ).rejects.toMatchObject({
      code: "DANSUGC_PURCHASE_OUTCOME_UNCERTAIN",
      kind: "uncertain",
    });

    const methods = request.mock.calls.map(([, init]) => init?.method ?? "GET");
    expect(methods).toEqual(["POST", "GET", "GET"]);
  });
});
