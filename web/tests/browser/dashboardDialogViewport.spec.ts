import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import path from "node:path";

test("keeps the dialog header and dismiss control reachable on a short phone viewport", async ({
  page,
}) => {
  const globalsCss = await readFile(
    path.join(process.cwd(), "app/globals.css"),
    "utf8",
  );
  const utilityMatch = globalsCss.match(
    /@utility dashboard-dialog-viewport \{([\s\S]*?)\n\}\n\n@utility dashboard-dialog-viewport-elevated/,
  );

  expect(utilityMatch).not.toBeNull();

  await page.setViewportSize({ height: 640, width: 390 });
  await page.setContent(`
    <style>
      * { box-sizing: border-box; }
      html, body { margin: 0; }
      .dashboard-dialog-viewport {${utilityMatch?.[1] ?? ""}}
      .dialog-panel {
        display: flex;
        width: 100%;
        min-height: 0;
        max-height: 100%;
        flex-direction: column;
        overflow: hidden;
        background: white;
      }
      .dialog-header {
        display: flex;
        flex-shrink: 0;
        align-items: center;
        justify-content: space-between;
        min-height: 64px;
        padding: 12px 16px;
      }
      .dialog-body {
        min-height: 0;
        overflow-y: auto;
        padding: 16px;
      }
      .dialog-section { height: 240px; }
    </style>
    <div class="dashboard-dialog-viewport" data-testid="viewport">
      <article class="dialog-panel" role="dialog" aria-labelledby="dialog-title">
        <header class="dialog-header" data-testid="header">
          <h1 id="dialog-title">Post analysis</h1>
          <button type="button" data-testid="dismiss">Close</button>
        </header>
        <div class="dialog-body" data-testid="body">
          <div class="dialog-section">Overview</div>
          <div class="dialog-section">Metrics</div>
          <div class="dialog-section">Timeline</div>
          <div class="dialog-section">Takeaways</div>
        </div>
      </article>
    </div>
  `);

  const viewport = page.getByTestId("viewport");
  const dialog = page.getByRole("dialog");
  const header = page.getByTestId("header");
  const dismiss = page.getByTestId("dismiss");
  const body = page.getByTestId("body");
  const initialDialogBox = await dialog.boundingBox();
  const initialHeaderBox = await header.boundingBox();
  const initialDismissBox = await dismiss.boundingBox();

  expect(initialDialogBox).not.toBeNull();
  expect(initialHeaderBox).not.toBeNull();
  expect(initialDismissBox).not.toBeNull();
  expect(initialDialogBox?.y).toBe(12);
  expect(initialHeaderBox?.y).toBeGreaterThanOrEqual(0);
  expect(
    (initialHeaderBox?.y ?? 0) + (initialHeaderBox?.height ?? 0),
  ).toBeLessThanOrEqual(640);
  expect(initialDismissBox?.y).toBeGreaterThanOrEqual(0);
  expect(
    (initialDismissBox?.y ?? 0) + (initialDismissBox?.height ?? 0),
  ).toBeLessThanOrEqual(640);
  await expect(viewport).toHaveCSS("overflow", "hidden");

  await body.evaluate((element) => {
    element.scrollTop = element.scrollHeight;
  });
  await expect
    .poll(() => body.evaluate((element) => element.scrollTop))
    .toBeGreaterThan(0);
  expect(await header.boundingBox()).toEqual(initialHeaderBox);
  expect(await dismiss.boundingBox()).toEqual(initialDismissBox);

  await body.evaluate((element) => {
    element.scrollTop = 0;
  });
  await expect.poll(() => body.evaluate((element) => element.scrollTop)).toBe(0);
  expect(await header.boundingBox()).toEqual(initialHeaderBox);
  expect(await dismiss.boundingBox()).toEqual(initialDismissBox);
  await expect(dismiss).toBeVisible();

  await body.evaluate((element) => {
    element.replaceChildren("Short dialog content");
  });
  await page.setViewportSize({ height: 900, width: 800 });

  const centeredDialogBox = await dialog.boundingBox();

  expect(centeredDialogBox).not.toBeNull();
  expect(
    Math.abs(
      (centeredDialogBox?.y ?? 0) -
        (900 - (centeredDialogBox?.height ?? 0)) / 2,
    ),
  ).toBeLessThan(1);
});
