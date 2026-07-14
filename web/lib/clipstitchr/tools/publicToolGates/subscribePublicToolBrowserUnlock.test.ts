import { afterEach, describe, expect, it, vi } from "vitest";
import { publicToolBrowserUnlockEventName } from "@/lib/clipstitchr/tools/publicToolGates/publicToolBrowserUnlockEventName";
import { publicToolUnlockMarker } from "@/lib/clipstitchr/tools/publicToolGates/publicToolUnlockMarker";
import { subscribePublicToolBrowserUnlock } from "@/lib/clipstitchr/tools/publicToolGates/subscribePublicToolBrowserUnlock";

describe("subscribePublicToolBrowserUnlock", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("observes same-tab and cross-tab unlock changes", () => {
    const listeners = new Map<string, EventListener>();
    const addEventListener = vi.fn(
      (name: string, listener: EventListener) => listeners.set(name, listener),
    );
    const removeEventListener = vi.fn();
    const onChange = vi.fn();
    vi.stubGlobal("window", { addEventListener, removeEventListener });

    const unsubscribe = subscribePublicToolBrowserUnlock(onChange);

    listeners.get(publicToolBrowserUnlockEventName)?.(new Event("unlock"));
    listeners.get("storage")?.(
      { key: "unrelated" } as unknown as StorageEvent,
    );
    listeners.get("storage")?.(
      { key: publicToolUnlockMarker.key } as unknown as StorageEvent,
    );

    expect(onChange).toHaveBeenCalledTimes(2);

    unsubscribe();
    expect(removeEventListener).toHaveBeenCalledWith(
      publicToolBrowserUnlockEventName,
      onChange,
    );
    expect(removeEventListener).toHaveBeenCalledWith(
      "storage",
      listeners.get("storage"),
    );
  });
});
