import { createHash } from "node:crypto";
import { join } from "node:path";
import type { Page } from "playwright";

export async function captureDemoAgentScreenshot(input: {
  index: number;
  page: Page;
  screenshotsDirectory: string;
  stepId?: string;
}) {
  const fileName = `${String(input.index + 1).padStart(3, "0")}-${input.stepId ?? "page"}.png`;
  const filePath = join(input.screenshotsDirectory, fileName);
  const buffer = await input.page.screenshot({
    fullPage: true,
    path: filePath,
  });

  return {
    fileName,
    filePath,
    fingerprint: createHash("sha256").update(buffer).digest("hex"),
  };
}
