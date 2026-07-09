import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export function getMacosWindowHelperPackagePath() {
  return join(
    dirname(fileURLToPath(import.meta.url)),
    "../../..",
    "native",
    "macos-window-helper",
  );
}
