import { createHash } from "crypto";
import { getStableBlogImageSourceId } from "./getStableBlogImageSourceId";

export function createBlogImageSourceHash(sourceUrl: string) {
  return createHash("sha256")
    .update(getStableBlogImageSourceId(sourceUrl))
    .digest("hex")
    .slice(0, 16);
}
