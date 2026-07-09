import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import { readDemoWalkthroughGuide } from "../../dist/demoGuide/readDemoWalkthroughGuide.js";
import { createDemoWalkthroughGuideFixture } from "./createDemoWalkthroughGuideFixture.js";

describe("readDemoWalkthroughGuide", () => {
  it("adds a fallback name to older saved guides", async () => {
    const directory = await mkdtemp(join(tmpdir(), "clipstitchr-guide-"));
    const filePath = join(directory, "guide_old.json");
    const { name: _name, ...guide } = createDemoWalkthroughGuideFixture({
      flowName: "Billing setup",
      id: "guide_old",
    });

    try {
      await writeFile(filePath, `${JSON.stringify(guide)}\n`, "utf8");

      const savedGuide = await readDemoWalkthroughGuide(filePath);

      assert.equal(savedGuide.name, "Billing setup");
    } finally {
      await rm(directory, { force: true, recursive: true });
    }
  });
});
