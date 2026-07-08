import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { observeDemoAgentPage } from "../../dist/demoAgent/observeDemoAgentPage.js";
import { withDemoAgentFixturePage } from "./withDemoAgentFixturePage.js";

describe("observeDemoAgentPage", () => {
  it("captures only simplified visible page state", async () => {
    await withDemoAgentFixturePage(async (page) => {
      await page.setContent(`
        <html>
          <head><title>Demo fixture</title></head>
          <body>
            <h1>Dashboard</h1>
            <button>Upload</button>
            <a href="/library">Library</a>
            <label for="email">Email</label>
            <input id="email" />
            <div role="dialog">Confirm upload</div>
            <button style="display: none">Delete account</button>
          </body>
        </html>
      `);

      const observation = await observeDemoAgentPage(page);

      assert.equal(observation.title, "Demo fixture");
      assert.deepEqual(
        observation.headings.map((element) => element.name),
        ["Dashboard"],
      );
      assert.deepEqual(
        observation.buttons.map((element) => element.name),
        ["Upload"],
      );
      assert.deepEqual(
        observation.links.map((element) => element.name),
        ["Library"],
      );
      assert.deepEqual(
        observation.inputs.map((element) => element.label),
        ["Email"],
      );
      assert.deepEqual(
        observation.dialogs.map((element) => element.name),
        ["Confirm upload"],
      );
      assert.equal(observation.canScrollDown, false);
      assert.equal(observation.canScrollUp, false);
    });
  });

  it("captures page scroll availability", async () => {
    await withDemoAgentFixturePage(async (page) => {
      await page.setViewportSize({ height: 400, width: 800 });
      await page.setContent(`
        <html>
          <body>
            <main style="height: 1400px">
              <h1>Top</h1>
              <button style="margin-top: 1200px">Hidden lower action</button>
            </main>
          </body>
        </html>
      `);

      const topObservation = await observeDemoAgentPage(page);

      assert.equal(topObservation.canScrollDown, true);
      assert.equal(topObservation.canScrollUp, false);

      await page.evaluate(() => window.scrollTo(0, 900));
      const lowerObservation = await observeDemoAgentPage(page);

      assert.equal(lowerObservation.canScrollUp, true);
    });
  });

  it("captures control state details for planner decisions", async () => {
    await withDemoAgentFixturePage(async (page) => {
      await page.setContent(`
        <button disabled>Generate</button>
        <label for="hook">Hooks to learn from</label>
        <input id="hook" placeholder="Paste hooks" value="Try this" />
        <label for="loop">Loop clip</label>
        <input id="loop" type="checkbox" checked />
      `);

      const observation = await observeDemoAgentPage(page);

      assert.equal(observation.buttons[0]?.disabled, true);
      assert.equal(observation.inputs[0]?.placeholder, "Paste hooks");
      assert.equal(observation.inputs[0]?.value, "Try this");
      assert.equal(observation.inputs[1]?.selected, true);
    });
  });
});
