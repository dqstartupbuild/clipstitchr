import type { StudioStitchRecipeV1 } from "../../types/studioStitch/StudioStitchRecipeV1";
import { assertStudioStitchRecipeV1 } from "./assertStudioStitchRecipeV1";
import { deepFreezeStudioStitchValue } from "./deepFreezeStudioStitchValue";
import { STUDIO_STITCH_RECIPE_SNAPSHOT_MAX_BYTES } from "./studioStitchRecipeSnapshotMaxBytes";

export function parseStudioStitchRecipe(snapshotJson: string): StudioStitchRecipeV1 {
  if (
    typeof snapshotJson !== "string" ||
    new TextEncoder().encode(snapshotJson).byteLength >
      STUDIO_STITCH_RECIPE_SNAPSHOT_MAX_BYTES
  ) {
    throw new Error("Studio Stitch recipe snapshot exceeds the 256 KiB limit.");
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(snapshotJson) as unknown;
  } catch {
    throw new Error("Studio Stitch recipe snapshot must be valid JSON.");
  }
  assertStudioStitchRecipeV1(parsed);
  return deepFreezeStudioStitchValue(parsed) as StudioStitchRecipeV1;
}
