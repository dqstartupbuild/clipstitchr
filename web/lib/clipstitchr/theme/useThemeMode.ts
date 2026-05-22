"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import { applyThemeMode } from "@/lib/clipstitchr/theme/applyThemeMode";
import { getServerThemeModeSnapshot } from "@/lib/clipstitchr/theme/getServerThemeModeSnapshot";
import { notifyThemeModeSubscribers } from "@/lib/clipstitchr/theme/notifyThemeModeSubscribers";
import { readStoredThemeMode } from "@/lib/clipstitchr/theme/readStoredThemeMode";
import { subscribeToThemeMode } from "@/lib/clipstitchr/theme/subscribeToThemeMode";
import type { ThemeMode } from "@/lib/clipstitchr/theme/ThemeMode";
import { writeStoredThemeMode } from "@/lib/clipstitchr/theme/writeStoredThemeMode";

export function useThemeMode() {
  const themeMode = useSyncExternalStore(
    subscribeToThemeMode,
    readStoredThemeMode,
    getServerThemeModeSnapshot,
  );

  useEffect(() => {
    applyThemeMode(themeMode);
  }, [themeMode]);

  const setThemeMode = useCallback((nextThemeMode: ThemeMode) => {
    writeStoredThemeMode(nextThemeMode);
    applyThemeMode(nextThemeMode);
    notifyThemeModeSubscribers();
  }, []);

  return { themeMode, setThemeMode };
}
