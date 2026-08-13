import { existsSync } from "node:fs";
import { resolve } from "node:path";

export function getLazyReelVendorRoot() {
  const roots = [
    resolve(process.cwd(), "vendor/lazyreel/v0_1_0/upstream"),
    resolve(process.cwd(), "web/vendor/lazyreel/v0_1_0/upstream"),
  ];

  return roots.find((root) => existsSync(root)) ?? roots[0];
}
