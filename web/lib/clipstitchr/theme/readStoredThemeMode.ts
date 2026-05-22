import { isThemeMode } from "@/lib/clipstitchr/theme/isThemeMode";
import type { ThemeMode } from "@/lib/clipstitchr/theme/ThemeMode";
import { themeModeStorageKey } from "@/lib/clipstitchr/theme/themeModeStorageKey";

export function readStoredThemeMode(): ThemeMode {
  if (typeof window === "undefined") {
    return "system";
  }

  try {
    const storedThemeMode = window.localStorage.getItem(themeModeStorageKey);

    return isThemeMode(storedThemeMode) ? storedThemeMode : "system";
  } catch {
    return "system";
  }
}
