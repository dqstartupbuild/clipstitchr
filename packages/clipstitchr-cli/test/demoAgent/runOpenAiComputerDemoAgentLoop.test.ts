import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { runOpenAiComputerDemoAgentLoop } from "../../dist/demoAgent/runOpenAiComputerDemoAgentLoop.js";
import type { OpenAiComputerRequestInput } from "../../src/demoAgent/OpenAiComputerRequestInput.js";
import type { OpenAiComputerResponse } from "../../src/demoAgent/OpenAiComputerResponse.js";
import { createDemoAgentTestGuide } from "./createDemoAgentTestGuide.js";
import { createDemoAgentTestPolicy } from "./createDemoAgentTestPolicy.js";
import { readDemoAgentTestActionLogEntries } from "./readDemoAgentTestActionLogEntries.js";
import { withDemoAgentFixturePage } from "./withDemoAgentFixturePage.js";
import { withDemoAgentFixtureServer } from "./withDemoAgentFixtureServer.js";
import { withDemoAgentRunPaths } from "./withDemoAgentRunPaths.js";

describe("runOpenAiComputerDemoAgentLoop", () => {
  it("executes a mocked computer action loop and sends screenshots back", async () => {
    await withDemoAgentFixtureServer(
      `
        <html>
          <body>
            <h1>Dashboard</h1>
            <button onclick="window.demoClicked = true">Start demo</button>
          </body>
        </html>
      `,
      async (origin) => {
        await withDemoAgentRunPaths(async (runPaths) => {
          await withDemoAgentFixturePage(async (page) => {
            await page.goto(`${origin}/dashboard`);

            const buttonBox = await page
              .getByRole("button", { name: "Start demo" })
              .boundingBox();
            const requests: OpenAiComputerRequestInput[] = [];

            assert.ok(buttonBox);

            const responses: OpenAiComputerResponse[] = [
              {
                id: "resp_1",
                output: [
                  {
                    actions: [
                      {
                        type: "click",
                        x: buttonBox.x + buttonBox.width / 2,
                        y: buttonBox.y + buttonBox.height / 2,
                      },
                    ],
                    call_id: "call_1",
                    type: "computer_call",
                  },
                ],
              },
              { id: "resp_2", output: [] },
            ];

            const result = await runOpenAiComputerDemoAgentLoop({
              apiKey: "test-key",
              guide: createDemoAgentTestGuide([
                { id: "step-1", label: "Start demo" },
              ]),
              model: "gpt-5.5",
              page,
              policy: createDemoAgentTestPolicy({
                allowedOrigins: [origin],
                allowedRoutes: ["/dashboard"],
              }),
              requester: async (request) => {
                requests.push(request);

                const response = responses.shift();

                assert.ok(response);
                return response;
              },
              runPaths,
              startedAtMs: Date.now(),
            });
            const entries = await readDemoAgentTestActionLogEntries(
              runPaths.actionLogPath,
            );

            assert.equal(result.stopReason, "guide-complete");
            assert.equal(result.screenshotCount, 1);
            assert.equal(result.stepTimings.length, 1);
            assert.equal(await page.evaluate("window.demoClicked"), true);
            assert.deepEqual(
              entries.map((entry) => entry.action),
              ["click", "screenshot", "finishStep"],
            );
            assert.equal(requests[1]?.previousResponseId, "resp_1");
            assert.equal(
              (
                requests[1]?.input as Array<{
                  output: { detail: string; type: string };
                  type: string;
                }>
              )[0]?.type,
              "computer_call_output",
            );
            assert.equal(
              (
                requests[1]?.input as Array<{
                  output: { detail: string; type: string };
                  type: string;
                }>
              )[0]?.output.detail,
              "original",
            );
          });
        });
      },
    );
  });

  it("finishes a scroll-tour step after enough OpenAI page scroll actions", async () => {
    await withDemoAgentFixtureServer(
      `
        <html>
          <body style="height: 5000px">
            <h1>Homepage</h1>
            <section style="margin-top: 4000px">Footer</section>
          </body>
        </html>
      `,
      async (origin) => {
        await withDemoAgentRunPaths(async (runPaths) => {
          await withDemoAgentFixturePage(async (page) => {
            await page.goto(`${origin}/`);

            const requests: OpenAiComputerRequestInput[] = [];
            const result = await runOpenAiComputerDemoAgentLoop({
              apiKey: "test-key",
              guide: createDemoAgentTestGuide([
                { id: "step-1", label: "Scroll through the page" },
              ]),
              model: "gpt-5.5",
              page,
              policy: createDemoAgentTestPolicy({
                allowedOrigins: [origin],
                allowedRoutes: ["/"],
              }),
              requester: async (request) => {
                requests.push(request);

                return {
                  id: "resp_1",
                  output: [
                    {
                      actions: [
                        {
                          scrollX: 0,
                          scrollY: 400,
                          type: "scroll",
                          x: 500,
                          y: 500,
                        },
                        { type: "wait" },
                        { keys: ["PAGEDOWN"], type: "keypress" },
                        {
                          scrollX: 0,
                          scrollY: 400,
                          type: "scroll",
                          x: 500,
                          y: 500,
                        },
                        { keys: ["PAGEDOWN"], type: "keypress" },
                      ],
                      call_id: "call_1",
                      type: "computer_call",
                    },
                  ],
                };
              },
              runPaths,
              startedAtMs: Date.now(),
            });
            const entries = await readDemoAgentTestActionLogEntries(
              runPaths.actionLogPath,
            );

            assert.equal(result.stopReason, "guide-complete");
            assert.equal(result.screenshotCount, 0);
            assert.equal(result.stepTimings.length, 1);
            assert.equal(requests.length, 1);
            assert.deepEqual(
              entries.map((entry) => entry.action),
              ["scroll", "wait", "pressKey", "scroll", "pressKey", "finishStep"],
            );
          });
        });
      },
    );
  });
});
