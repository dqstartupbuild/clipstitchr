import { postBridgeSupportedPlatforms } from "@/lib/clipstitchr/server/postBridge/postBridgeSupportedPlatforms";
import type { PostBridgePlatform } from "@/lib/clipstitchr/types/PostBridgePlatform";

export function isPostBridgePlatform(value: unknown): value is PostBridgePlatform {
  return (
    typeof value === "string" &&
    postBridgeSupportedPlatforms.includes(value as PostBridgePlatform)
  );
}
