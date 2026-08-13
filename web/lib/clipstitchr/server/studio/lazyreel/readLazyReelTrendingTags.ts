import { readFileSync } from "node:fs";
import { join } from "node:path";
import { getLazyReelVendorRoot } from "./getLazyReelVendorRoot";

export function readLazyReelTrendingTags() {
  const path = join(
    getLazyReelVendorRoot(),
    "mcp",
    "data",
    "trending-hashtags.csv",
  );

  return readFileSync(path, "utf8")
    .split(/\r?\n/u)
    .slice(1)
    .filter(Boolean)
    .map((line) => {
      const [tag = "", year = "0", rank = "0", posts = "0"] = line.split(",");
      return {
        posts: Number(posts),
        rank: Number(rank),
        tag,
        year: Number(year),
      };
    });
}
