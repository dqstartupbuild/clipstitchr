import type { HookLabLifecycleEventName } from "@/lib/clipstitchr/types/HookLabLifecycleEventName";

const SESSION_STORAGE_PREFIX = "clipstitchr_hook_lab_lifecycle_event";
const fallbackClaims = new Set<string>();

export function claimHookLabLifecycleEvent(
  eventName: HookLabLifecycleEventName,
  lifecycleKey: string,
) {
  if (typeof window === "undefined") {
    return false;
  }

  const claim = `${eventName}:${lifecycleKey}`;
  const storageKey = `${SESSION_STORAGE_PREFIX}:${claim}`;

  try {
    if (window.sessionStorage.getItem(storageKey) === "1") {
      return false;
    }

    window.sessionStorage.setItem(storageKey, "1");

    return true;
  } catch {
    if (fallbackClaims.has(claim)) {
      return false;
    }

    fallbackClaims.add(claim);
    return true;
  }
}
