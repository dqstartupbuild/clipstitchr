import { publicToolBrowserUnlockEventName } from "@/lib/clipstitchr/tools/publicToolGates/publicToolBrowserUnlockEventName";
import { publicToolUnlockMarker } from "@/lib/clipstitchr/tools/publicToolGates/publicToolUnlockMarker";

export function subscribePublicToolBrowserUnlock(onChange: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key === publicToolUnlockMarker.key) {
      onChange();
    }
  };

  window.addEventListener(publicToolBrowserUnlockEventName, onChange);
  window.addEventListener("storage", handleStorage);

  return () => {
    window.removeEventListener(publicToolBrowserUnlockEventName, onChange);
    window.removeEventListener("storage", handleStorage);
  };
}
