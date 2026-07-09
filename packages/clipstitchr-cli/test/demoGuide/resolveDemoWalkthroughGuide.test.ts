import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import { resolveDemoWalkthroughGuide } from "../../dist/demoGuide/resolveDemoWalkthroughGuide.js";
import { resolveDemoWalkthroughGuidePath } from "../../dist/demoGuide/resolveDemoWalkthroughGuidePath.js";
import { writeDemoWalkthroughGuide } from "../../dist/demoGuide/writeDemoWalkthroughGuide.js";
import { createDemoWalkthroughGuideFixture } from "./createDemoWalkthroughGuideFixture.js";

describe("resolveDemoWalkthroughGuide", () => {
  it("resolves guides by name, ID, and path", async () => {
    const directory = await mkdtemp(join(tmpdir(), "clipstitchr-guide-"));
    const guide = createDemoWalkthroughGuideFixture({
      id: "guide_checkout",
      name: "Checkout flow",
    });

    try {
      const filePath = await writeDemoWalkthroughGuide(guide, directory);

      assert.equal(
        (await resolveDemoWalkthroughGuide("Checkout flow", directory))?.id,
        "guide_checkout",
      );
      assert.equal(
        (await resolveDemoWalkthroughGuide("guide_checkout", directory))?.id,
        "guide_checkout",
      );
      assert.equal(
        (await resolveDemoWalkthroughGuide(filePath, directory))?.id,
        "guide_checkout",
      );
      assert.equal(
        await resolveDemoWalkthroughGuidePath("Checkout flow", directory),
        filePath,
      );
    } finally {
      await rm(directory, { force: true, recursive: true });
    }
  });

  it("explains ambiguous guide names", async () => {
    const directory = await mkdtemp(join(tmpdir(), "clipstitchr-guide-"));

    try {
      await writeDemoWalkthroughGuide(
        createDemoWalkthroughGuideFixture({
          id: "guide_first",
          name: "Shared guide",
        }),
        directory,
      );
      await writeDemoWalkthroughGuide(
        createDemoWalkthroughGuideFixture({
          id: "guide_second",
          name: "Shared guide",
        }),
        directory,
      );

      await assert.rejects(
        () => resolveDemoWalkthroughGuide("Shared guide", directory),
        /guide_first[\s\S]*guide_second/,
      );
    } finally {
      await rm(directory, { force: true, recursive: true });
    }
  });
});
