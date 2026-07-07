import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { executeDemoAgentAction } from "../../dist/demoAgent/executeDemoAgentAction.js";
import { withDemoAgentFixturePage } from "./withDemoAgentFixturePage.js";

describe("executeDemoAgentAction", () => {
  it("clicks visible role targets", async () => {
    await withDemoAgentFixturePage(async (page) => {
      await page.setContent(`
        <button onclick="window.clicked = true">Upload</button>
      `);

      await executeDemoAgentAction({
        action: {
          target: { name: "Upload", role: "button" },
          type: "click",
        },
        page,
      });

      assert.equal(
        await page.evaluate(
          () => (window as Window & { clicked?: boolean }).clicked,
        ),
        true,
      );
    });
  });

  it("types only through approved resolved values", async () => {
    await withDemoAgentFixturePage(async (page) => {
      await page.setContent(`
        <label for="email">Email</label>
        <input id="email" />
      `);

      await executeDemoAgentAction({
        action: {
          resolvedValue: "demo@example.com",
          target: { label: "Email" },
          type: "type",
          valueKey: "testEmail",
        },
        page,
      });

      assert.equal(await page.getByLabel("Email").inputValue(), "demo@example.com");
    });
  });

  it("uploads resolved local files through visible file labels", async () => {
    const directory = await mkdtemp(join(tmpdir(), "clipstitchr-agent-test-"));
    const filePath = join(directory, "demo-sample.mp4");

    try {
      await writeFile(filePath, "fixture");

      await withDemoAgentFixturePage(async (page) => {
        await page.setContent(`
          <label for="video">Video</label>
          <input id="video" type="file" />
        `);

        await executeDemoAgentAction({
          action: {
            fileKey: "demo-sample.mp4",
            resolvedFilePath: filePath,
            target: { label: "Video" },
            type: "uploadFile",
          },
          page,
        });

        assert.equal(
          await page.getByLabel("Video").evaluate((input) => {
            return (input as HTMLInputElement).files?.[0]?.name;
          }),
          "demo-sample.mp4",
        );
      });
    } finally {
      await rm(directory, { force: true, recursive: true });
    }
  });

  it("waits for visible text through user-facing text lookup", async () => {
    await withDemoAgentFixturePage(async (page) => {
      await page.setContent(`<main>Ready for review</main>`);

      await executeDemoAgentAction({
        action: {
          timeoutMs: 1000,
          type: "waitFor",
          visibleText: "Ready for review",
        },
        page,
      });

      assert.equal(await page.getByText("Ready for review").isVisible(), true);
    });
  });
});
