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
    });
  });
});
