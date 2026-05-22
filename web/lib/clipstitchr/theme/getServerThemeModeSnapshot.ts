import type { ThemeMode } from "@/lib/clipstitchr/theme/ThemeMode";

export function getServerThemeModeSnapshot(): ThemeMode {
  return "system";
}
