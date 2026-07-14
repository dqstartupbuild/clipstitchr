import { publicToolBrowserUnlockEventName } from "@/lib/clipstitchr/tools/publicToolGates/publicToolBrowserUnlockEventName";
import { publicToolBrowserUnlockMemory } from "@/lib/clipstitchr/tools/publicToolGates/publicToolBrowserUnlockMemory";
import { publicToolUnlockMarker } from "@/lib/clipstitchr/tools/publicToolGates/publicToolUnlockMarker";

export function setPublicToolBrowserUnlocked() {
  if (typeof window === "undefined") {
    return false;
  }

  publicToolBrowserUnlockMemory.isUnlocked = true;

  let isPersisted = false;

  try {
    window.localStorage.setItem(
      publicToolUnlockMarker.key,
      publicToolUnlockMarker.value,
    );
    isPersisted = true;
  } catch {
    // The current tab remains unlocked through the in-memory marker.
  }

  try {
    window.dispatchEvent(new Event(publicToolBrowserUnlockEventName));
  } catch {
    // Storage success must not depend on event support.
  }

  return isPersisted;
}
