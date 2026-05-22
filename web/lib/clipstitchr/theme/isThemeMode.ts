import type { ThemeMode } from "@/lib/clipstitchr/theme/ThemeMode";

export function isThemeMode(value: unknown): value is ThemeMode {
  return value === "system" || value === "light" || value === "dark";
}
