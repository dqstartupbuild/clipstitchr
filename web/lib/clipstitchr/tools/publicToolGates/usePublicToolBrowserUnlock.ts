"use client";

import { useSyncExternalStore } from "react";
import { getPublicToolBrowserIsUnlocked } from "@/lib/clipstitchr/tools/publicToolGates/getPublicToolBrowserIsUnlocked";
import { getPublicToolBrowserUnlockServerSnapshot } from "@/lib/clipstitchr/tools/publicToolGates/getPublicToolBrowserUnlockServerSnapshot";
import { subscribePublicToolBrowserUnlock } from "@/lib/clipstitchr/tools/publicToolGates/subscribePublicToolBrowserUnlock";

export function usePublicToolBrowserUnlock() {
  return useSyncExternalStore(
    subscribePublicToolBrowserUnlock,
    getPublicToolBrowserIsUnlocked,
    getPublicToolBrowserUnlockServerSnapshot,
  );
}
