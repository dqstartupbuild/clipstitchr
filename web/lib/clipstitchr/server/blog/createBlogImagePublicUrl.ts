import { createCanonicalUrl } from "@/lib/site";
import { blogImageStoragePrefix } from "./blogImageStoragePrefix";

export function createBlogImagePublicUrl(key: string) {
  const keyPrefix = `${blogImageStoragePrefix}/`;

  if (!key.startsWith(keyPrefix)) {
    throw new Error("Blog image object key is outside the public blog prefix.");
  }

  const routePath = key
    .slice(keyPrefix.length)
    .split("/")
    .map(encodeURIComponent)
    .join("/");

  return createCanonicalUrl(`/${blogImageStoragePrefix}/${routePath}`);
}
