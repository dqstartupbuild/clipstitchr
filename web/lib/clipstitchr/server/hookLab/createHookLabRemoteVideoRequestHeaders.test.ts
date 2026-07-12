import { describe, expect, it } from "vitest";
import { createHookLabRemoteVideoRequestHeaders } from "@/lib/clipstitchr/server/hookLab/createHookLabRemoteVideoRequestHeaders";

describe("createHookLabRemoteVideoRequestHeaders", () => {
  it("authorizes only an exact Apify key-value-store record URL", () => {
    expect(
      createHookLabRemoteVideoRequestHeaders(
        new URL(
          "https://api.apify.com/v2/key-value-stores/store_1/records/video.mp4",
        ),
        " apify-token ",
      ),
    ).toEqual({
      accept: "video/*",
      authorization: "Bearer apify-token",
    });

    expect(
      createHookLabRemoteVideoRequestHeaders(
        new URL(
          "https://api.apify.com.evil.example/v2/key-value-stores/store_1/records/video.mp4",
        ),
        "apify-token",
      ),
    ).toEqual({ accept: "video/*" });
    expect(
      createHookLabRemoteVideoRequestHeaders(
        new URL("https://api.apify.com/v2/datasets/dataset_1/items"),
        "apify-token",
      ),
    ).toEqual({ accept: "video/*" });
  });
});
