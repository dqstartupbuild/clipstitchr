import type { StudioStitchTalkingHookFamily } from "../../types/studioStitch/StudioStitchTalkingHookFamily";
import { STUDIO_STITCH_TALKING_HOOK_FAMILIES } from "./studioStitchTalkingHookFamilies";

export function isStudioStitchTalkingHookFamily(
  value: unknown,
): value is StudioStitchTalkingHookFamily {
  return (
    typeof value === "string" &&
    (STUDIO_STITCH_TALKING_HOOK_FAMILIES as readonly string[]).includes(value)
  );
}
