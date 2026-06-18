import { automationSwiprPackSelectionLimit } from "../constants/automationSwiprPackSelectionLimit";
import { normalizeSwiprLibraryQueryKey } from "./normalizeSwiprLibraryQueryKey";
import { normalizeSwiprLibraryQueryName } from "./normalizeSwiprLibraryQueryName";

export function normalizeAutomationSwiprSelectedLibraryPackNames(
  packNames: string[],
) {
  const normalizedNames: string[] = [];
  const seenKeys = new Set<string>();

  for (const packName of packNames) {
    const normalizedName = normalizeSwiprLibraryQueryName(packName);
    const key = normalizeSwiprLibraryQueryKey(normalizedName);

    if (!normalizedName || seenKeys.has(key)) {
      continue;
    }

    normalizedNames.push(normalizedName);
    seenKeys.add(key);

    if (normalizedNames.length >= automationSwiprPackSelectionLimit) {
      break;
    }
  }

  return normalizedNames;
}
