import { createHash } from "node:crypto";
import { join } from "node:path";
import type { Page } from "playwright";
import type { OpenAiComputerScreenshot } from "./OpenAiComputerScreenshot.js";

export async function captureOpenAiComputerScreenshot(input: {
  index: number;
  page: Page;
  screenshotsDirectory: string;
  stepId?: string;
}): Promise<OpenAiComputerScreenshot> {
  const fileName = `${String(input.index + 1).padStart(3, "0")}-${input.stepId ?? "page"}-openai-computer.png`;
  const filePath = join(input.screenshotsDirectory, fileName);
  const buffer = await input.page.screenshot({
    path: filePath,
    type: "png",
  });

  return {
    base64: buffer.toString("base64"),
    fileName,
    filePath,
    fingerprint: createHash("sha256").update(buffer).digest("hex"),
  };
}
