import { select } from "@inquirer/prompts";
import { createMacosWindowMatch } from "./createMacosWindowMatch.js";
import { formatMacosWindowLabel } from "./formatMacosWindowLabel.js";
import type { MacosWindowHelperClient } from "./MacosWindowHelperClient.js";
import type { MacosWindowInfo } from "./MacosWindowInfo.js";

export async function selectMacosWindow(input: {
  helper: MacosWindowHelperClient;
  preferredMatch?: string;
}) {
  if (input.preferredMatch?.trim()) {
    try {
      return await input.helper.selectWindow({ match: input.preferredMatch });
    } catch {
      // Fall through to manual selection when the saved match is stale.
    }
  }

  const windows = await input.helper.listWindows();

  if (!windows.length) {
    throw new Error("No visible macOS windows were found.");
  }

  const selectedWindowId = await select({
    choices: windows.slice(0, 40).map((window: MacosWindowInfo) => ({
      description: `${Math.round(window.bounds.width)}x${Math.round(window.bounds.height)}`,
      name: formatMacosWindowLabel(window),
      value: window.id,
    })),
    message: "Choose the window ClipStitchr can control.",
  });

  const window = await input.helper.selectWindow({ windowId: selectedWindowId });

  return {
    ...window,
    preferredMatch: createMacosWindowMatch(window),
  };
}
