import type { Page } from "playwright";
import { normalizeOpenAiComputerKey } from "./normalizeOpenAiComputerKey.js";
import { withOpenAiComputerModifierKeys } from "./withOpenAiComputerModifierKeys.js";

export async function pressOpenAiComputerKey(page: Page, key: string) {
  const parts = key
    .split("+")
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length <= 1) {
    await page.keyboard.press(normalizeOpenAiComputerKey(key));
    return;
  }

  const keyToPress = parts.at(-1);

  if (!keyToPress) {
    return;
  }

  await withOpenAiComputerModifierKeys(page, parts.slice(0, -1), async () => {
    await page.keyboard.press(normalizeOpenAiComputerKey(keyToPress));
  });
}
