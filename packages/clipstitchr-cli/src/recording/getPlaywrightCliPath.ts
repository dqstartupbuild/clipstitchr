import { createRequire } from "node:module";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);

export function getPlaywrightCliPath() {
  const packageJsonPath = require.resolve("playwright/package.json");

  return join(dirname(packageJsonPath), "cli.js");
}
