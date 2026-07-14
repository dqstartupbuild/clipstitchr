import { publicToolBrowserUnlockMemory } from "@/lib/clipstitchr/tools/publicToolGates/publicToolBrowserUnlockMemory";
import { publicToolUnlockMarker } from "@/lib/clipstitchr/tools/publicToolGates/publicToolUnlockMarker";

export function getPublicToolBrowserIsUnlocked() {
  if (typeof window === "undefined") {
    return false;
  }

  if (publicToolBrowserUnlockMemory.isUnlocked) {
    return true;
  }

  try {
    const isUnlocked =
      window.localStorage.getItem(publicToolUnlockMarker.key) ===
      publicToolUnlockMarker.value;

    if (isUnlocked) {
      publicToolBrowserUnlockMemory.isUnlocked = true;
    }

    return isUnlocked;
  } catch {
    return false;
  }
}
