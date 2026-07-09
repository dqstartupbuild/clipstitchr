import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { runDemoAgentLoop } from "../../dist/demoAgent/runDemoAgentLoop.js";
import { assertDemoAgentTestEntriesIncludeUrls } from "./assertDemoAgentTestEntriesIncludeUrls.js";
import { createDemoAgentTestGuide } from "./createDemoAgentTestGuide.js";
import { createDemoAgentTestPolicy } from "./createDemoAgentTestPolicy.js";
import { readDemoAgentTestActionLogEntries } from "./readDemoAgentTestActionLogEntries.js";
import { withDemoAgentFixturePage } from "./withDemoAgentFixturePage.js";
import { withDemoAgentFixtureServer } from "./withDemoAgentFixtureServer.js";
import { withDemoAgentRunPaths } from "./withDemoAgentRunPaths.js";

describe("runDemoAgentLoop", () => {
  it("completes a safe multi-step guide flow and logs URL transitions", async () => {
    await withDemoAgentFixtureServer(
      `
        <html>
          <head><title>Safe fixture</title></head>
          <body>
            <h1>Dashboard</h1>
            <label for="email">Email</label>
            <input id="email" />
            <button onclick="window.uploadClicked = true">
              Upload sample clip
            </button>
          </body>
        </html>
      `,
      async (origin) => {
        await withDemoAgentRunPaths(async (runPaths) => {
          await withDemoAgentFixturePage(async (page) => {
            await page.goto(`${origin}/dashboard`);

            const result = await runDemoAgentLoop({
              guide: createDemoAgentTestGuide([
                { id: "step-1", label: "Email" },
                { id: "step-2", label: "Upload sample clip" },
              ]),
              page,
              policy: createDemoAgentTestPolicy({
                allowedOrigins: [origin],
                allowedRoutes: ["/dashboard"],
              }),
              runPaths,
              startedAtMs: Date.now(),
            });
            const entries = await readDemoAgentTestActionLogEntries(
              runPaths.actionLogPath,
            );

            assert.equal(result.stopReason, "guide-complete");
            assert.equal(result.screenshotCount, 2);
            assert.equal(result.stepTimings.length, 2);
            assert.equal(
              await page.getByLabel("Email").inputValue(),
              "demo@example.com",
            );
            assert.equal(
              await page.evaluate("window.uploadClicked"),
              true,
            );
            assert.deepEqual(
              entries.map((entry) => entry.action),
              [
                "screenshot",
                "type",
                "finishStep",
                "screenshot",
                "click",
                "finishStep",
              ],
            );
            assertDemoAgentTestEntriesIncludeUrls(entries);
          });
        });
      },
    );
  });

  it("stops before acting when observed page text is blocked", async () => {
    await withDemoAgentFixtureServer(
      `
        <html>
          <head><title>Billing fixture</title></head>
          <body>
            <h1>Billing settings</h1>
            <button>Continue</button>
          </body>
        </html>
      `,
      async (origin) => {
        await withDemoAgentRunPaths(async (runPaths) => {
          await withDemoAgentFixturePage(async (page) => {
            await page.goto(`${origin}/dashboard`);

            const result = await runDemoAgentLoop({
              guide: createDemoAgentTestGuide([
                { id: "step-1", label: "Continue" },
              ]),
              page,
              policy: createDemoAgentTestPolicy({
                allowedOrigins: [origin],
                allowedRoutes: ["/dashboard"],
              }),
              runPaths,
              startedAtMs: Date.now(),
            });
            const entries = await readDemoAgentTestActionLogEntries(
              runPaths.actionLogPath,
            );

            assert.equal(result.stopReason, "blocked-page-state");
            assert.equal(result.screenshotCount, 0);
            assert.equal(result.stepTimings.length, 0);
            assert.equal(entries.length, 1);
            assert.equal(entries[0]?.action, "stop");
            assert.equal(entries[0]?.result, "blocked");
            assert.equal(entries[0]?.details?.policyDecision, "blocked");
            assert.match(String(entries[0]?.details?.error), /billing/i);
            assertDemoAgentTestEntriesIncludeUrls(entries);
          });
        });
      },
    );
  });

  it("stops before acting on an auth wall", async () => {
    await withDemoAgentFixtureServer(
      `
        <html>
          <head><title>Sign in</title></head>
          <body>
            <h1>Sign in</h1>
            <label for="password">Password</label>
            <input id="password" type="password" />
            <button>Continue</button>
          </body>
        </html>
      `,
      async (origin) => {
        await withDemoAgentRunPaths(async (runPaths) => {
          await withDemoAgentFixturePage(async (page) => {
            await page.goto(`${origin}/dashboard`);

            const result = await runDemoAgentLoop({
              guide: createDemoAgentTestGuide([
                { id: "step-1", label: "Continue" },
              ]),
              page,
              policy: createDemoAgentTestPolicy({
                allowedOrigins: [origin],
                allowedRoutes: ["/dashboard"],
              }),
              runPaths,
              startedAtMs: Date.now(),
            });
            const entries = await readDemoAgentTestActionLogEntries(
              runPaths.actionLogPath,
            );

            assert.equal(result.stopReason, "blocked-page-state");
            assert.equal(result.screenshotCount, 0);
            assert.equal(entries[0]?.action, "stop");
            assert.equal(entries[0]?.result, "blocked");
            assert.match(String(entries[0]?.details?.error), /password/i);
            assertDemoAgentTestEntriesIncludeUrls(entries);
          });
        });
      },
    );
  });

  it("blocks an injected planner action before it can leave the app", async () => {
    await withDemoAgentFixtureServer(
      `
        <html>
          <head><title>Planner fixture</title></head>
          <body>
            <h1>Dashboard</h1>
          </body>
        </html>
      `,
      async (origin) => {
        await withDemoAgentRunPaths(async (runPaths) => {
          await withDemoAgentFixturePage(async (page) => {
            await page.goto(`${origin}/dashboard`);

            const result = await runDemoAgentLoop({
              guide: createDemoAgentTestGuide([
                { id: "step-1", label: "Leave the app" },
              ]),
              page,
              planner: () => ({
                path: "https://example.com/account",
                type: "navigate",
              }),
              policy: createDemoAgentTestPolicy({
                allowedOrigins: [origin],
                allowedRoutes: ["/dashboard"],
              }),
              runPaths,
              startedAtMs: Date.now(),
            });
            const entries = await readDemoAgentTestActionLogEntries(
              runPaths.actionLogPath,
            );

            assert.equal(result.stopReason, "same-action-failed");
            assert.equal(page.url(), `${origin}/dashboard`);
            assert.deepEqual(
              entries.map((entry) => entry.result),
              ["blocked", "blocked"],
            );
            assert.equal(entries[0]?.action, "navigate");
            assert.equal(entries[0]?.details?.policyDecision, "blocked");
            assert.match(String(entries[0]?.details?.error), /cannot leave/i);
            assertDemoAgentTestEntriesIncludeUrls(entries);
          });
        });
      },
    );
  });

  it("allows an injected planner to type safe text into a visible input", async () => {
    await withDemoAgentFixtureServer(
      `
        <html>
          <head><title>Hook Lab fixture</title></head>
          <body>
            <h1>Hook Lab</h1>
            <label for="hooks">Hooks to learn from <span>Add one per line</span></label>
            <textarea id="hooks"></textarea>
          </body>
        </html>
      `,
      async (origin) => {
        await withDemoAgentRunPaths(async (runPaths) => {
          await withDemoAgentFixturePage(async (page) => {
            await page.goto(`${origin}/dashboard/hooks`);
            let callCount = 0;

            const result = await runDemoAgentLoop({
              guide: createDemoAgentTestGuide([
                { id: "step-1", label: "Add hooks to learn from" },
              ]),
              page,
              planner: () => {
                callCount += 1;

                if (callCount === 1) {
                  return {
                    stepId: "step-1",
                    target: { label: "Hooks to learn from" },
                    type: "type",
                    valueText:
                      "Stop guessing what to post.\nTurn one clip into a week of ideas.",
                  };
                }

                return {
                  stepId: "step-1",
                  type: "finishStep",
                };
              },
              policy: createDemoAgentTestPolicy({
                allowedOrigins: [origin],
                allowedRoutes: ["/dashboard/hooks"],
              }),
              runPaths,
              startedAtMs: Date.now(),
            });
            const entries = await readDemoAgentTestActionLogEntries(
              runPaths.actionLogPath,
            );

            assert.equal(result.stopReason, "guide-complete");
            assert.equal(
              await page.getByLabel("Hooks to learn from").inputValue(),
              "Stop guessing what to post.\nTurn one clip into a week of ideas.",
            );
            assert.deepEqual(
              entries.map((entry) => entry.action),
              ["type", "finishStep"],
            );
            assert.deepEqual(
              entries.map((entry) => entry.result),
              ["ok", "ok"],
            );
          });
        });
      },
    );
  });

  it("blocks injected planner click targets missing from the observation", async () => {
    await withDemoAgentFixtureServer(
      `
        <html>
          <head><title>Hook cards fixture</title></head>
          <body>
            <h1>Hook Lab</h1>
            <button onclick="window.accepted = true">Accept hook</button>
          </body>
        </html>
      `,
      async (origin) => {
        await withDemoAgentRunPaths(async (runPaths) => {
          await withDemoAgentFixturePage(async (page) => {
            await page.goto(`${origin}/dashboard/hooks`);

            const result = await runDemoAgentLoop({
              guide: createDemoAgentTestGuide([
                { id: "step-1", label: "Accept saved hook" },
              ]),
              page,
              planner: () => ({
                stepId: "step-1",
                target: { name: "Save as winner", role: "button" },
                type: "click",
              }),
              policy: createDemoAgentTestPolicy({
                allowedOrigins: [origin],
                allowedRoutes: ["/dashboard/hooks"],
              }),
              runPaths,
              startedAtMs: Date.now(),
            });
            const entries = await readDemoAgentTestActionLogEntries(
              runPaths.actionLogPath,
            );

            assert.equal(result.stopReason, "same-action-failed");
            assert.equal(await page.evaluate("window.accepted"), undefined);
            assert.deepEqual(
              entries.map((entry) => entry.result),
              ["blocked", "blocked"],
            );
            assert.match(
              String(entries[0]?.details?.error),
              /not visible in the current page observation/i,
            );
            assert.equal(entries[0]?.details?.policyDecision, "blocked");
            assertDemoAgentTestEntriesIncludeUrls(entries);
          });
        });
      },
    );
  });

  it("completes a safe modal flow", async () => {
    await withDemoAgentFixtureServer(
      `
        <html>
          <head><title>Modal fixture</title></head>
          <body>
            <h1>Dashboard</h1>
            <button onclick="document.querySelector('[role=dialog]').style.display = 'block'">
              Open settings
            </button>
            <div role="dialog" style="display: none">
              <h2>Settings</h2>
              <button onclick="window.modalConfirmed = true">
                Confirm setup
              </button>
            </div>
          </body>
        </html>
      `,
      async (origin) => {
        await withDemoAgentRunPaths(async (runPaths) => {
          await withDemoAgentFixturePage(async (page) => {
            await page.goto(`${origin}/dashboard`);

            const result = await runDemoAgentLoop({
              guide: createDemoAgentTestGuide([
                { id: "step-1", label: "Open settings" },
                { id: "step-2", label: "Confirm setup" },
              ]),
              page,
              policy: createDemoAgentTestPolicy({
                allowedOrigins: [origin],
                allowedRoutes: ["/dashboard"],
              }),
              runPaths,
              startedAtMs: Date.now(),
            });
            const entries = await readDemoAgentTestActionLogEntries(
              runPaths.actionLogPath,
            );

            assert.equal(result.stopReason, "guide-complete");
            assert.equal(result.screenshotCount, 2);
            assert.equal(result.stepTimings.length, 2);
            assert.equal(await page.evaluate("window.modalConfirmed"), true);
            assert.deepEqual(
              entries.map((entry) => entry.action),
              [
                "screenshot",
                "click",
                "finishStep",
                "screenshot",
                "click",
                "finishStep",
              ],
            );
            assertDemoAgentTestEntriesIncludeUrls(entries);
          });
        });
      },
    );
  });

  it("waits for delayed content before finishing a loading step", async () => {
    await withDemoAgentFixtureServer(
      `
        <html>
          <head><title>Loading fixture</title></head>
          <body>
            <h1 id="status">Loading report</h1>
            <script>
              setTimeout(() => {
                document.getElementById("status").textContent = "Report ready";
              }, 100);
            </script>
          </body>
        </html>
      `,
      async (origin) => {
        await withDemoAgentRunPaths(async (runPaths) => {
          await withDemoAgentFixturePage(async (page) => {
            await page.goto(`${origin}/dashboard`);

            const result = await runDemoAgentLoop({
              guide: createDemoAgentTestGuide([
                { id: "step-1", label: "Report ready" },
              ]),
              page,
              policy: createDemoAgentTestPolicy({
                allowedOrigins: [origin],
                allowedRoutes: ["/dashboard"],
              }),
              runPaths,
              startedAtMs: Date.now(),
            });
            const entries = await readDemoAgentTestActionLogEntries(
              runPaths.actionLogPath,
            );

            assert.equal(result.stopReason, "guide-complete");
            assert.equal(result.screenshotCount, 1);
            assert.equal(result.stepTimings.length, 1);
            assert.deepEqual(
              entries.map((entry) => entry.action),
              ["screenshot", "waitFor", "finishStep"],
            );
            assertDemoAgentTestEntriesIncludeUrls(entries);
          });
        });
      },
    );
  });

  it("stops immediately when an approved click leaves the allowed origin", async () => {
    await withDemoAgentFixtureServer(
      `<html><body><h1>External target</h1></body></html>`,
      async (externalOrigin) => {
        await withDemoAgentFixtureServer(
          `
            <html>
              <head><title>Redirect fixture</title></head>
              <body>
                <h1>Dashboard</h1>
                <button onclick="window.location.href = '${externalOrigin}/dashboard'">
                  Open dashboard
                </button>
              </body>
            </html>
          `,
          async (origin) => {
            await withDemoAgentRunPaths(async (runPaths) => {
              await withDemoAgentFixturePage(async (page) => {
                await page.goto(`${origin}/dashboard`);

                const result = await runDemoAgentLoop({
                  guide: createDemoAgentTestGuide([
                    { id: "step-1", label: "Open dashboard" },
                    { id: "step-2", label: "Dashboard loaded" },
                  ]),
                  page,
                  policy: createDemoAgentTestPolicy({
                    allowedOrigins: [origin],
                    allowedRoutes: ["/dashboard"],
                  }),
                  runPaths,
                  startedAtMs: Date.now(),
                });
                const entries = await readDemoAgentTestActionLogEntries(
                  runPaths.actionLogPath,
                );
                const blockedEntry = entries.at(-1);

                assert.equal(result.stopReason, "external-navigation");
                assert.equal(blockedEntry?.action, "click");
                assert.equal(blockedEntry?.result, "blocked");
                assert.equal(blockedEntry?.stopReason, "external-navigation");
                assert.equal(blockedEntry?.details?.policyDecision, "blocked");
                assert.ok(
                  String(blockedEntry?.details?.urlAfter).startsWith(
                    externalOrigin,
                  ),
                );
                assertDemoAgentTestEntriesIncludeUrls(entries);
              });
            });
          },
        );
      },
    );
  });

  it("stops immediately when an approved click reaches a disallowed route", async () => {
    await withDemoAgentFixtureServer(
      `
        <html>
          <head><title>Route fixture</title></head>
          <body>
            <h1>Dashboard</h1>
            <button onclick="window.location.href = '/missing'">
              Open missing page
            </button>
          </body>
        </html>
      `,
      async (origin) => {
        await withDemoAgentRunPaths(async (runPaths) => {
          await withDemoAgentFixturePage(async (page) => {
            await page.goto(`${origin}/dashboard`);

            const result = await runDemoAgentLoop({
              guide: createDemoAgentTestGuide([
                { id: "step-1", label: "Open missing page" },
                { id: "step-2", label: "Missing page loaded" },
              ]),
              page,
              policy: createDemoAgentTestPolicy({
                allowedOrigins: [origin],
                allowedRoutes: ["/dashboard"],
              }),
              runPaths,
              startedAtMs: Date.now(),
            });
            const entries = await readDemoAgentTestActionLogEntries(
              runPaths.actionLogPath,
            );
            const blockedEntry = entries.at(-1);

            assert.equal(result.stopReason, "disallowed-route");
            assert.equal(blockedEntry?.action, "click");
            assert.equal(blockedEntry?.result, "blocked");
            assert.equal(blockedEntry?.stopReason, "disallowed-route");
            assert.equal(blockedEntry?.details?.policyDecision, "blocked");
            assert.match(String(blockedEntry?.details?.urlAfter), /\/missing$/);
            assertDemoAgentTestEntriesIncludeUrls(entries);
          });
        });
      },
    );
  });

  it("stops when the same URL and screenshot fingerprint repeat", async () => {
    await withDemoAgentFixtureServer(
      `
        <html>
          <head><title>Static fixture</title></head>
          <body>
            <h1>Static dashboard</h1>
          </body>
        </html>
      `,
      async (origin) => {
        await withDemoAgentRunPaths(async (runPaths) => {
          await withDemoAgentFixturePage(async (page) => {
            await page.goto(`${origin}/dashboard`);

            const result = await runDemoAgentLoop({
              guide: createDemoAgentTestGuide([
                { id: "step-1", label: "First static step" },
                { id: "step-2", label: "Second static step" },
              ]),
              page,
              policy: createDemoAgentTestPolicy({
                allowedOrigins: [origin],
                allowedRoutes: ["/dashboard"],
                stuckStateLimit: 2,
              }),
              runPaths,
              startedAtMs: Date.now(),
            });
            const entries = await readDemoAgentTestActionLogEntries(
              runPaths.actionLogPath,
            );

            assert.equal(result.stopReason, "repeated-page-state");
            assert.equal(result.screenshotCount, 2);
            assert.equal(result.stepTimings.length, 1);
            assert.deepEqual(
              entries.map((entry) => entry.action),
              ["screenshot", "finishStep", "screenshot"],
            );
            assertDemoAgentTestEntriesIncludeUrls(entries);
          });
        });
      },
    );
  });

  it("stops before acting on an allowed route that renders a 404 page", async () => {
    await withDemoAgentFixtureServer(
      `
        <html>
          <head><title>Not found</title></head>
          <body>
            <h1>404 not found</h1>
            <button>Continue</button>
          </body>
        </html>
      `,
      async (origin) => {
        await withDemoAgentRunPaths(async (runPaths) => {
          await withDemoAgentFixturePage(async (page) => {
            await page.goto(`${origin}/missing`);

            const result = await runDemoAgentLoop({
              guide: createDemoAgentTestGuide([
                { id: "step-1", label: "Continue" },
              ]),
              page,
              policy: createDemoAgentTestPolicy({
                allowedOrigins: [origin],
                allowedRoutes: ["/missing"],
              }),
              runPaths,
              startedAtMs: Date.now(),
            });
            const entries = await readDemoAgentTestActionLogEntries(
              runPaths.actionLogPath,
            );

            assert.equal(result.stopReason, "not-found-page");
            assert.equal(result.screenshotCount, 0);
            assert.equal(entries.length, 1);
            assert.equal(entries[0]?.action, "stop");
            assert.equal(entries[0]?.result, "blocked");
            assert.equal(entries[0]?.stopReason, "not-found-page");
            assertDemoAgentTestEntriesIncludeUrls(entries);
          });
        });
      },
    );
  });

  it("stops when the recording time limit is reached", async () => {
    await withDemoAgentFixtureServer(
      `
        <html>
          <head><title>Time cap fixture</title></head>
          <body>
            <h1>Dashboard</h1>
            <button>Continue</button>
          </body>
        </html>
      `,
      async (origin) => {
        await withDemoAgentRunPaths(async (runPaths) => {
          await withDemoAgentFixturePage(async (page) => {
            await page.goto(`${origin}/dashboard`);

            const result = await runDemoAgentLoop({
              guide: createDemoAgentTestGuide([
                { id: "step-1", label: "Continue" },
              ]),
              page,
              policy: createDemoAgentTestPolicy({
                allowedOrigins: [origin],
                allowedRoutes: ["/dashboard"],
                maxRecordingSeconds: 10,
              }),
              runPaths,
              startedAtMs: Date.now() - 10_000,
            });
            const entries = await readDemoAgentTestActionLogEntries(
              runPaths.actionLogPath,
            );

            assert.equal(result.stopReason, "max-recording-seconds");
            assert.equal(result.actionCount, 0);
            assert.equal(entries.length, 1);
            assert.equal(entries[0]?.action, "stop");
            assert.equal(entries[0]?.stopReason, "max-recording-seconds");
          });
        });
      },
    );
  });

  it("stops when the max action count is reached", async () => {
    await withDemoAgentFixtureServer(
      `
        <html>
          <head><title>Action cap fixture</title></head>
          <body>
            <h1>Dashboard</h1>
            <button>Continue</button>
          </body>
        </html>
      `,
      async (origin) => {
        await withDemoAgentRunPaths(async (runPaths) => {
          await withDemoAgentFixturePage(async (page) => {
            await page.goto(`${origin}/dashboard`);

            const result = await runDemoAgentLoop({
              guide: createDemoAgentTestGuide([
                { id: "step-1", label: "Continue" },
              ]),
              page,
              policy: createDemoAgentTestPolicy({
                allowedOrigins: [origin],
                allowedRoutes: ["/dashboard"],
                maxActions: 1,
              }),
              runPaths,
              startedAtMs: Date.now(),
            });
            const entries = await readDemoAgentTestActionLogEntries(
              runPaths.actionLogPath,
            );

            assert.equal(result.stopReason, "max-actions");
            assert.equal(result.actionCount, 1);
            assert.deepEqual(
              entries.map((entry) => entry.action),
              ["screenshot", "stop"],
            );
            assert.equal(entries[1]?.stopReason, "max-actions");
          });
        });
      },
    );
  });

  it("finishes a repeated generic scroll step after enough scrolling", async () => {
    await withDemoAgentFixtureServer(
      `
        <html>
          <head><title>Scroll fixture</title></head>
          <body style="height: 4000px">
            <h1>Homepage</h1>
            <section style="margin-top: 3000px">Lower page content</section>
          </body>
        </html>
      `,
      async (origin) => {
        await withDemoAgentRunPaths(async (runPaths) => {
          await withDemoAgentFixturePage(async (page) => {
            await page.goto(`${origin}/`);

            const result = await runDemoAgentLoop({
              guide: createDemoAgentTestGuide([
                { id: "step-1", label: "Scroll through the page" },
              ]),
              page,
              planner: () => ({
                direction: "down",
                reason: "Keep scrolling through the page.",
                stepId: "step-1",
                type: "scroll",
              }),
              policy: createDemoAgentTestPolicy({
                allowedOrigins: [origin],
                allowedRoutes: ["/"],
              }),
              runPaths,
              startedAtMs: Date.now(),
            });
            const entries = await readDemoAgentTestActionLogEntries(
              runPaths.actionLogPath,
            );

            assert.equal(result.stopReason, "guide-complete");
            assert.equal(result.stepTimings.length, 1);
            assert.deepEqual(
              entries.map((entry) => entry.action),
              ["scroll", "scroll", "scroll", "scroll", "finishStep"],
            );
          });
        });
      },
    );
  });

  it("stops when a guide step makes no progress", async () => {
    await withDemoAgentFixtureServer(
      `
        <html>
          <head><title>No progress fixture</title></head>
          <body>
            <h1>Dashboard</h1>
          </body>
        </html>
      `,
      async (origin) => {
        await withDemoAgentRunPaths(async (runPaths) => {
          await withDemoAgentFixturePage(async (page) => {
            await page.goto(`${origin}/dashboard`);

            const result = await runDemoAgentLoop({
              guide: createDemoAgentTestGuide([
                { id: "step-1", label: "Never finished" },
              ]),
              page,
              planner: () => ({
                reason: "Keep waiting without satisfying the step.",
                stepId: "step-1",
                type: "waitFor",
              }),
              policy: createDemoAgentTestPolicy({
                allowedOrigins: [origin],
                allowedRoutes: ["/dashboard"],
              }),
              runPaths,
              startedAtMs: Date.now(),
            });
            const entries = await readDemoAgentTestActionLogEntries(
              runPaths.actionLogPath,
            );

            assert.equal(result.stopReason, "no-step-progress");
            assert.equal(result.actionCount, 10);
            assert.equal(entries.length, 11);
            assert.deepEqual(
              entries.map((entry) => entry.action).slice(0, 10),
              Array.from({ length: 10 }, () => "waitFor"),
            );
            assert.equal(entries[10]?.action, "stop");
            assert.equal(entries[10]?.stopReason, "no-step-progress");
          });
        });
      },
    );
  });
});
