import { existsSync } from "node:fs";
import path from "node:path";
import { createCanonicalUrl, createOgAssetPath } from "@/lib/site";

export function resolveOgImage(pathname: string) {
  const assetPath = createOgAssetPath(pathname);
  const absoluteAssetPath = path.join(
    process.cwd(),
    "public",
    assetPath.replace(/^\//, ""),
  );

  if (existsSync(absoluteAssetPath)) {
    return createCanonicalUrl(assetPath);
  }

  return createCanonicalUrl("/og/default.png");
}
