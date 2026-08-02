import type { PostBridgeSourceType } from "@/lib/clipstitchr/types/PostBridgeSourceType";

export function getPostBridgeSourceType(value: FormDataEntryValue | null) {
  if (value === "stitch" || value === "swipe") {
    return value satisfies PostBridgeSourceType;
  }

  throw new Error("Choose a stitch or Swipe before scheduling.");
}
