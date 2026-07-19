import { describe, expect, it } from "vitest";
import { createUploadNormalizationFilter } from "./createUploadNormalizationFilter.mjs";

const sourceMetadata = {
  aspectRatio: 16 / 9,
  duration: 10,
  hasAudio: true,
  height: 1080,
  width: 1920,
};

describe("createUploadNormalizationFilter", () => {
  it("keeps the simple crop filter for crop-fill", () => {
    expect(
      createUploadNormalizationFilter({
        layout: "crop-fill",
        sourceMetadata,
      }),
    ).toEqual({
      mode: "vf",
      value:
        "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1",
    });
  });

  it("creates a background filter graph for fit-with-background", () => {
    const filter = createUploadNormalizationFilter({
      layout: "fit-with-background",
      sourceMetadata,
    });

    expect(filter.mode).toBe("filter-complex");
    expect(filter.value).toContain("boxblur=40:1");
    expect(filter.value).toContain("overlay=x='(W-w)/2'");
  });
});
