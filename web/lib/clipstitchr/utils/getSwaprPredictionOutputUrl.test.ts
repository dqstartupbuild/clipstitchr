import { describe, expect, it } from "vitest";
import { getSwaprPredictionOutputUrl } from "@/lib/clipstitchr/utils/getSwaprPredictionOutputUrl";

describe("getSwaprPredictionOutputUrl", () => {
  it("returns a string output URL", () => {
    expect(getSwaprPredictionOutputUrl("https://replicate.delivery/output.mp4")).toBe(
      "https://replicate.delivery/output.mp4",
    );
  });

  it("returns the first URL from an output array", () => {
    expect(
      getSwaprPredictionOutputUrl([
        null,
        { url: "https://replicate.delivery/first.mp4" },
        "https://replicate.delivery/second.mp4",
      ]),
    ).toBe("https://replicate.delivery/first.mp4");
  });

  it("returns a nested video file URL", () => {
    expect(
      getSwaprPredictionOutputUrl({
        video: {
          url: "https://v3.fal.media/files/generated-output.mp4",
        },
      }),
    ).toBe("https://v3.fal.media/files/generated-output.mp4");
  });

  it("returns a nested video string URL", () => {
    expect(
      getSwaprPredictionOutputUrl({
        video: "https://replicate.delivery/generated-output.mp4",
      }),
    ).toBe("https://replicate.delivery/generated-output.mp4");
  });

  it("returns null when no output URL exists", () => {
    expect(getSwaprPredictionOutputUrl({ video: "missing" })).toBeNull();
  });
});
