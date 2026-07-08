import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { executeDemoAgentAction } from "../../dist/demoAgent/executeDemoAgentAction.js";
import { withDemoAgentFixturePage } from "./withDemoAgentFixturePage.js";
import { withDemoAgentFixtureServer } from "./withDemoAgentFixtureServer.js";

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

  it("waits for delayed click navigation to settle", async () => {
    await withDemoAgentFixtureServer(
      `
        <html>
          <body>
            <button onclick="setTimeout(() => { window.location.href = '/next'; }, 100)">
              Continue
            </button>
          </body>
        </html>
      `,
      async (origin) => {
        await withDemoAgentFixturePage(async (page) => {
          await page.goto(origin);

          await executeDemoAgentAction({
            action: {
              target: { name: "Continue", role: "button" },
              type: "click",
            },
            page,
          });

          assert.equal(page.url(), `${origin}/next`);
        });
      },
    );
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

  it("scrolls the page", async () => {
    await withDemoAgentFixturePage(async (page) => {
      await page.setViewportSize({ height: 400, width: 800 });
      await page.setContent(`
        <main style="height: 1400px">
          <h1>Top</h1>
          <button style="margin-top: 1200px">Lower action</button>
        </main>
      `);

      await executeDemoAgentAction({
        action: {
          direction: "down",
          type: "scroll",
        },
        page,
      });

      assert.ok((await page.evaluate(() => window.scrollY)) > 0);
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

  it("handles form controls, modes, and keyboard actions", async () => {
    await withDemoAgentFixturePage(async (page) => {
      await page.setContent(`
        <label for="format">Format</label>
        <select id="format"><option>Long</option><option>Short</option></select>
        <label for="search">Search</label>
        <input id="search" value="old text" onkeydown="window.keyPressed = event.key" />
        <label for="loop">Loop clip</label>
        <input id="loop" type="checkbox" />
        <label for="volume">Volume</label>
        <input id="volume" type="range" min="0" max="100" value="10" />
        <button onclick="window.mode = 'Normal'">Normal</button>
      `);

      await executeDemoAgentAction({
        action: {
          optionLabel: "Short",
          target: { label: "Format" },
          type: "selectOption",
        },
        page,
      });
      await executeDemoAgentAction({
        action: { target: { label: "Search" }, type: "clearField" },
        page,
      });
      await executeDemoAgentAction({
        action: {
          checked: true,
          target: { label: "Loop clip" },
          type: "toggle",
        },
        page,
      });
      await executeDemoAgentAction({
        action: {
          target: { label: "Volume" },
          type: "setSlider",
          value: 70,
        },
        page,
      });
      await executeDemoAgentAction({
        action: { mode: "Normal", type: "setMode" },
        page,
      });
      await executeDemoAgentAction({
        action: { key: "Enter", target: { label: "Search" }, type: "pressKey" },
        page,
      });

      assert.equal(await page.getByLabel("Format").inputValue(), "Short");
      assert.equal(await page.getByLabel("Search").inputValue(), "");
      assert.equal(await page.getByLabel("Loop clip").isChecked(), true);
      assert.equal(await page.getByLabel("Volume").inputValue(), "70");
      assert.equal(
        await page.evaluate(() => (window as Window & { mode?: string }).mode),
        "Normal",
      );
      assert.equal(
        await page.evaluate(
          () => (window as Window & { keyPressed?: string }).keyPressed,
        ),
        "Enter",
      );
    });
  });

  it("handles scrolling, menus, dialogs, cards, and library choices", async () => {
    await withDemoAgentFixturePage(async (page) => {
      await page.setViewportSize({ height: 400, width: 800 });
      await page.setContent(`
        <button onclick="document.querySelector('#menu').hidden = false">More</button>
        <div id="menu" hidden>
          <button role="menuitem" onclick="window.menuChoice = 'Rename'">Rename</button>
        </div>
        <button onclick="window.copied = true">Copy</button>
        <main style="height: 1400px">
          <p style="margin-top: 900px">Results section</p>
          <button onclick="window.clickedLower = true">Lower action</button>
          <article>
            <h2>Demo clip</h2>
            <button onclick="window.cardAction = true">Use</button>
          </article>
          <article>
            <h2>latest clip</h2>
            <button onclick="window.libraryChoice = true">Select</button>
          </article>
        </main>
        <script>
          document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') window.dialogClosed = true;
          });
        </script>
      `);

      await executeDemoAgentAction({
        action: { text: "Results section", type: "scrollToText" },
        page,
      });
      const scrollAfterText = await page.evaluate(() => window.scrollY);

      await executeDemoAgentAction({
        action: {
          target: { name: "Lower action", role: "button" },
          type: "scrollToControl",
        },
        page,
      });
      await executeDemoAgentAction({
        action: {
          target: { name: "Lower action", role: "button" },
          type: "clickFirstMatching",
        },
        page,
      });
      await executeDemoAgentAction({
        action: { target: { name: "More", role: "button" }, type: "openMenu" },
        page,
      });
      await executeDemoAgentAction({
        action: { name: "Rename", type: "chooseMenuItem" },
        page,
      });
      await executeDemoAgentAction({
        action: {
          actionName: "Use",
          cardText: "Demo clip",
          type: "clickCardAction",
        },
        page,
      });
      await executeDemoAgentAction({
        action: {
          mediaType: "ugc",
          searchText: "latest clip",
          type: "chooseFileFromLibrary",
        },
        page,
      });
      await executeDemoAgentAction({
        action: { type: "closeDialog" },
        page,
      });
      await executeDemoAgentAction({
        action: { target: { name: "Copy", role: "button" }, type: "copyToClipboard" },
        page,
      });

      assert.ok(scrollAfterText > 0);
      assert.equal(
        await page.evaluate(
          () => (window as Window & { clickedLower?: boolean }).clickedLower,
        ),
        true,
      );
      assert.equal(
        await page.evaluate(
          () => (window as Window & { menuChoice?: string }).menuChoice,
        ),
        "Rename",
      );
      assert.equal(
        await page.evaluate(
          () => (window as Window & { cardAction?: boolean }).cardAction,
        ),
        true,
      );
      assert.equal(
        await page.evaluate(
          () => (window as Window & { libraryChoice?: boolean }).libraryChoice,
        ),
        true,
      );
      assert.equal(
        await page.evaluate(
          () => (window as Window & { dialogClosed?: boolean }).dialogClosed,
        ),
        true,
      );
      assert.equal(
        await page.evaluate(
          () => (window as Window & { copied?: boolean }).copied,
        ),
        true,
      );
    });
  });

  it("handles job waits, enabled waits, drag and drop, downloads, and media", async () => {
    await withDemoAgentFixturePage(async (page) => {
      await page.setContent(`
        <button id="generate" disabled>Generate</button>
        <section id="status"></section>
        <div draggable="true">Clip A</div>
        <div ondragover="event.preventDefault()" ondrop="window.dropped = true">Drop here</div>
        <a href="data:text/plain,demo" download="demo.txt">Download</a>
        <button onclick="window.previewPlayed = true">Preview</button>
        <video></video>
        <script>
          setTimeout(() => {
            document.querySelector('#generate').disabled = false;
            document.querySelector('#status').textContent = 'Finished stitch';
          }, 50);
        </script>
      `);

      await executeDemoAgentAction({
        action: {
          target: { name: "Generate", role: "button" },
          timeoutMs: 1000,
          type: "waitForElementEnabled",
        },
        page,
      });
      await executeDemoAgentAction({
        action: {
          timeoutMs: 1000,
          type: "waitForJob",
          visibleText: "Finished stitch",
        },
        page,
      });
      await executeDemoAgentAction({
        action: {
          sourceText: "Clip A",
          targetText: "Drop here",
          type: "dragAndDrop",
        },
        page,
      });
      await executeDemoAgentAction({
        action: {
          mediaAction: "play",
          targetLabel: "Preview",
          type: "playPauseMedia",
        },
        page,
      });
      await executeDemoAgentAction({
        action: { seconds: 8, type: "seekMedia" },
        page,
      });
      await executeDemoAgentAction({
        action: {
          target: { name: "Download", role: "link" },
          type: "downloadFile",
        },
        page,
      });

      assert.equal(
        await page.evaluate(
          () => (window as Window & { dropped?: boolean }).dropped,
        ),
        true,
      );
      assert.equal(
        await page.evaluate(
          () => (window as Window & { previewPlayed?: boolean }).previewPlayed,
        ),
        true,
      );
      assert.equal(
        await page.locator("video").evaluate((video) => {
          return (video as HTMLVideoElement).currentTime;
        }),
        8,
      );
    });
  });
});
