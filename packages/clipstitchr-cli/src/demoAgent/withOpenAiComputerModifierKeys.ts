import type { Page } from "playwright";
import { normalizeOpenAiComputerKey } from "./normalizeOpenAiComputerKey.js";

export async function withOpenAiComputerModifierKeys(
  page: Page,
  keys: string[] | undefined,
  action: () => Promise<void>,
) {
  const normalizedKeys = (keys ?? []).map(normalizeOpenAiComputerKey);
  const pressedKeys: string[] = [];

  try {
    for (const key of normalizedKeys) {
      await page.keyboard.down(key);
      pressedKeys.push(key);
    }

    await action();
  } finally {
    for (const key of pressedKeys.reverse()) {
      await page.keyboard.up(key);
    }
  }
}
