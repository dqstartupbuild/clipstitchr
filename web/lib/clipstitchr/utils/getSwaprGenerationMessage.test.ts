import { describe, expect, it } from "vitest";
import { getSwaprGenerationMessage } from "@/lib/clipstitchr/utils/getSwaprGenerationMessage";
import type { SwaprGenerationStatus } from "@/lib/clipstitchr/types/SwaprGenerationStatus";

describe("getSwaprGenerationMessage", () => {
  it("returns user-facing copy for every Swapr generation status", () => {
    const cases: Array<[SwaprGenerationStatus, string]> = [
      ["uploading", "Preparing your selected photo and clip."],
      ["queued", "Swap queued for background processing."],
      ["processing", "Swapping..."],
      ["downloading", "Getting the finished clip."],
      ["normalizing", "Preparing the clip for your library."],
      ["stitching", "Stitching swapped segments."],
      ["saving", "Saving the clip to your library."],
      ["succeeded", "Swap saved to your library."],
      ["failed", "Swap failed. Please try again."],
      ["idle", "Choose a photo and UGC clip to start."],
    ];

    for (const [status, message] of cases) {
      expect(getSwaprGenerationMessage(status)).toBe(message);
    }
    expect(getSwaprGenerationMessage("unknown" as SwaprGenerationStatus)).toBe(
      "Choose a photo and UGC clip to start.",
    );
  });
});
