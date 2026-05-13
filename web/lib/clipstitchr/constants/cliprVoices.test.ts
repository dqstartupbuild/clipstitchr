import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { cliprVoices } from "@/lib/clipstitchr/constants/cliprVoices";

describe("cliprVoices", () => {
  it("points every voice to a bundled audio preview", () => {
    const previewSources = new Set<string>();

    for (const voice of cliprVoices) {
      const publicAssetPath = voice.previewSrc.replace(/^\//, "");

      expect(voice.previewSrc).toMatch(/^\/audio\/clipr-voices\/.+\.m4a$/);
      expect(previewSources.has(voice.previewSrc)).toBe(false);
      expect(existsSync(join(process.cwd(), "public", publicAssetPath))).toBe(
        true,
      );

      previewSources.add(voice.previewSrc);
    }

    expect(previewSources.size).toBe(cliprVoices.length);
  });
});
