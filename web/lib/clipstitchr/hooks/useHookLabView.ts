"use client";

import { useCallback, useEffect, useState } from "react";
import type { HookLabView } from "@/lib/clipstitchr/types/HookLabView";
import { getCurrentHookLabView } from "@/lib/clipstitchr/utils/getCurrentHookLabView";

export function useHookLabView() {
  const [view, setViewState] = useState<HookLabView>("ideas");

  useEffect(() => {
    const syncView = () => setViewState(getCurrentHookLabView());

    syncView();
    window.addEventListener("popstate", syncView);
    return () => window.removeEventListener("popstate", syncView);
  }, []);

  const setView = useCallback((nextView: HookLabView) => {
    setViewState(nextView);

    const url = new URL(window.location.href);
    url.searchParams.set("view", nextView);
    window.history.replaceState(null, "", url.toString());
  }, []);

  return { setView, view };
}
