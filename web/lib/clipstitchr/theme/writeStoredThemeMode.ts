import type { ThemeMode } from "@/lib/clipstitchr/theme/ThemeMode";
import { themeModeStorageKey } from "@/lib/clipstitchr/theme/themeModeStorageKey";

export function writeStoredThemeMode(themeMode: ThemeMode) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    if (themeMode === "system") {
      window.localStorage.removeItem(themeModeStorageKey);
      return;
    }

    window.localStorage.setItem(themeModeStorageKey, themeMode);
  } catch {
    return;
  }
}
