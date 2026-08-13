import { describe, expect, it } from "vitest";
import { getStudioClipsCapabilities } from "./getStudioClipsCapabilities";

describe("getStudioClipsCapabilities", () => {
  it("publishes deterministic vendored templates and honest unavailable states", () => {
    const capabilities = getStudioClipsCapabilities("product_1", {
      message: "Adapter missing.",
      reasonCode: "worker_adapter_not_configured",
      state: "unavailable",
    });
    expect(capabilities.schemaVersion).toBe("studio-clips-capabilities-v1");
    expect(capabilities.sourceSnapshotVersion).toBe("supoclip-v0_1_0");
    expect(capabilities.captionStyle.templates.map((template) => template.id)).toEqual([
      "default",
      "hormozi",
      "mrbeast",
      "minimal",
      "tiktok",
      "neon",
      "podcast",
    ]);
    expect(capabilities.captionStyle.builtInFonts).toHaveLength(21);
    expect(capabilities.captionStyle.execution).toBe("rendered");
    expect(capabilities.analysis.state).toBe("unavailable");
    expect(capabilities.outputMetadata.state).toBe("unavailable");
    expect(capabilities.captionStyle.customFontUpload.state).toBe("available");
    expect(capabilities.outputFormats).toContainEqual(
      expect.objectContaining({ id: "split_screen", state: "unavailable" }),
    );
    expect(capabilities.platformExports).toEqual([
      expect.objectContaining({ id: "tiktok", state: "unavailable" }),
      expect.objectContaining({ id: "instagram_reels", state: "unavailable" }),
      expect.objectContaining({ id: "youtube_shorts", state: "unavailable" }),
    ]);
  });
});
