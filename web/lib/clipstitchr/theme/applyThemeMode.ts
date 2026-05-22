import type { ThemeMode } from "@/lib/clipstitchr/theme/ThemeMode";

export function applyThemeMode(themeMode: ThemeMode) {
  if (typeof document === "undefined") {
    return;
  }

  document.documentElement.dataset.themeMode = themeMode;

  if (themeMode === "system") {
    document.documentElement.removeAttribute("data-theme");
    return;
  }

  document.documentElement.dataset.theme = themeMode;
}
