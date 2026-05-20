import { afterEach, describe, expect, it, vi } from "vitest";
import { downloadSwaprPredictionOutputBlob } from "@/lib/clipstitchr/client/downloadSwaprPredictionOutputBlob";
import { expandSwaprPhotoWithAi } from "@/lib/clipstitchr/client/expandSwaprPhotoWithAi";
import { waitForSwaprPrediction } from "@/lib/clipstitchr/client/waitForSwaprPrediction";

const mocks = vi.hoisted(() => ({
  waitForSwaprPollInterval: vi.fn(),
}));

vi.mock("@/lib/clipstitchr/utils/waitForSwaprPollInterval", () => ({
  waitForSwaprPollInterval: mocks.waitForSwaprPollInterval,
}));

describe("Swapr client helpers", () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  it("posts image and mask blobs for AI expansion", async () => {
    const expanded = new Blob(["expanded"], { type: "image/png" });

    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        blob: vi.fn(async () => expanded),
        ok: true,
      })),
    );

    await expect(
      expandSwaprPhotoWithAi(new Blob(["image"]), new Blob(["mask"])),
    ).resolves.toBe(expanded);

    expect(fetch).toHaveBeenCalledWith("/api/swapr/photos/expand", {
      body: expect.any(FormData),
      method: "POST",
    });
  });

  it("surfaces AI expansion errors", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        json: vi.fn(async () => ({ message: "Expansion failed." })),
        ok: false,
      })),
    );

    await expect(
      expandSwaprPhotoWithAi(new Blob(["image"]), new Blob(["mask"])),
    ).rejects.toThrow("Expansion failed.");
  });

  it("polls Swapr predictions until success and reports status changes", async () => {
    const onStatusChange = vi.fn();

    mocks.waitForSwaprPollInterval.mockResolvedValue(undefined);
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        json: vi.fn(async () => ({
          id: "prediction_1",
          output: ["https://replicate.test/out.mp4"],
          status: "succeeded",
        })),
        ok: true,
      })),
    );

    await expect(
      waitForSwaprPrediction({
        onStatusChange,
        prediction: {
          id: "prediction_1",
          status: "processing",
        },
      }),
    ).resolves.toEqual(
      expect.objectContaining({
        status: "succeeded",
      }),
    );
    expect(fetch).toHaveBeenCalledWith("/api/swapr/jobs/prediction_1");
    expect(onStatusChange).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "succeeded",
      }),
    );
  });

  it("rejects failed predictions and downloads successful output blobs", async () => {
    await expect(
      waitForSwaprPrediction({
        prediction: {
          error: "Swap failed",
          id: "prediction_1",
          status: "failed",
        },
      }),
    ).rejects.toThrow("Swap failed");

    const outputBlob = new Blob(["video"], { type: "video/mp4" });

    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        blob: vi.fn(async () => outputBlob),
        ok: true,
      })),
    );

    await expect(
      downloadSwaprPredictionOutputBlob({
        id: "prediction_1",
        output: ["https://replicate.test/out.mp4"],
        status: "succeeded",
      }),
    ).resolves.toBe(outputBlob);
    expect(fetch).toHaveBeenCalledWith(
      "/api/swapr/output?id=prediction_1&url=https%3A%2F%2Freplicate.test%2Fout.mp4",
    );

    await expect(
      downloadSwaprPredictionOutputBlob({
        id: "prediction_1",
        output: null,
        status: "succeeded",
      }),
    ).rejects.toThrow("did not return a video URL");
  });
});
