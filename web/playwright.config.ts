import { defineConfig } from "@playwright/test";
import { tmpdir } from "node:os";
import path from "node:path";

export default defineConfig({
  outputDir: path.join(tmpdir(), "clipstitchr-playwright-results"),
  testDir: "./tests/browser",
  use: {
    viewport: { height: 640, width: 390 },
  },
});
