import { describe, expect, it } from "vitest";
import type { StudioClipsRenderRevisionSummary } from "@/lib/clipstitchr/types/studioClips/StudioClipsRenderRevisionSummary";
import { getStudioClipsRenderOperationLabel } from "./getStudioClipsRenderOperationLabel";

describe("getStudioClipsRenderOperationLabel", () => {
  it("uses a destination-specific label for platform exports", () => {
    expect(
      getStudioClipsRenderOperationLabel({
        operationKind: "platform_export",
        platformPreset: "youtube_shorts",
      } as StudioClipsRenderRevisionSummary),
    ).toBe("YouTube Shorts export");
  });

  it("uses plain labels for edit renders", () => {
    expect(
      getStudioClipsRenderOperationLabel({
        operationKind: "regenerate",
      } as StudioClipsRenderRevisionSummary),
    ).toBe("Regenerated clip");
  });
});
