import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { executeOpenAiComputerAction } from "../../dist/demoAgent/executeOpenAiComputerAction.js";
import { createDemoAgentTestPolicy } from "./createDemoAgentTestPolicy.js";
import { withDemoAgentFixturePage } from "./withDemoAgentFixturePage.js";

describe("executeOpenAiComputerAction", () => {
  it("types safe text into the focused field", async () => {
    await withDemoAgentFixturePage(async (page) => {
      await page.setContent(`
        <html>
          <body>
            <label for="title">Title</label>
            <input id="title" />
          </body>
        </html>
      `);

      await page.getByLabel("Title").focus();
      await executeOpenAiComputerAction({
        action: { text: "Launch demo", type: "type" },
        page,
        policy: createDemoAgentTestPolicy(),
      });

      assert.equal(await page.getByLabel("Title").inputValue(), "Launch demo");
    });
  });

  it("blocks sensitive text before typing", async () => {
    await withDemoAgentFixturePage(async (page) => {
      await page.setContent(`
        <html>
          <body>
            <label for="title">Title</label>
            <input id="title" />
          </body>
        </html>
      `);

      await page.getByLabel("Title").focus();
      await assert.rejects(
        executeOpenAiComputerAction({
          action: { text: "password", type: "type" },
          page,
          policy: createDemoAgentTestPolicy(),
        }),
        /blocked action: password/i,
      );
      assert.equal(await page.getByLabel("Title").inputValue(), "");
    });
  });
});
