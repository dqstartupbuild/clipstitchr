import { postBridgeSupportedPlatforms } from "@/lib/clipstitchr/server/postBridge/postBridgeSupportedPlatforms";

export function createSupportedPostBridgePlatformQuery(limit = 100) {
  const query = new URLSearchParams({
    limit: String(limit),
  });

  postBridgeSupportedPlatforms.forEach((platform) => {
    query.append("platform", platform);
  });

  return query;
}
