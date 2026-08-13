import type { StudioStitchClassicHookFamily } from "../../types/studioStitch/StudioStitchClassicHookFamily";
import { STUDIO_STITCH_CLASSIC_HOOK_FAMILIES } from "./studioStitchClassicHookFamilies";

export function isStudioStitchClassicHookFamily(
  value: unknown,
): value is StudioStitchClassicHookFamily {
  return (
    typeof value === "string" &&
    (STUDIO_STITCH_CLASSIC_HOOK_FAMILIES as readonly string[]).includes(value)
  );
}
