import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { publicToolBrowserUnlockEventName } from "@/lib/clipstitchr/tools/publicToolGates/publicToolBrowserUnlockEventName";
import { publicToolBrowserUnlockMemory } from "@/lib/clipstitchr/tools/publicToolGates/publicToolBrowserUnlockMemory";
import { publicToolUnlockMarker } from "@/lib/clipstitchr/tools/publicToolGates/publicToolUnlockMarker";
import { setPublicToolBrowserUnlocked } from "@/lib/clipstitchr/tools/publicToolGates/setPublicToolBrowserUnlocked";

describe("setPublicToolBrowserUnlocked", () => {
  beforeEach(() => {
    publicToolBrowserUnlockMemory.isUnlocked = false;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    publicToolBrowserUnlockMemory.isUnlocked = false;
  });

  it("does not create cross-request server state", () => {
    expect(setPublicToolBrowserUnlocked()).toBe(false);
    expect(publicToolBrowserUnlockMemory.isUnlocked).toBe(false);
  });

  it("stores only one global marker and not contact data", () => {
    const dispatchEvent = vi.fn();
    const setItem = vi.fn();
    vi.stubGlobal("window", {
      dispatchEvent,
      localStorage: { setItem },
    });

    expect(setPublicToolBrowserUnlocked()).toBe(true);
    expect(setItem).toHaveBeenCalledWith(
      publicToolUnlockMarker.key,
      publicToolUnlockMarker.value,
    );
    expect(JSON.stringify(setItem.mock.calls)).not.toMatch(
      /name|email|token|example\.com/i,
    );
    expect(dispatchEvent).toHaveBeenCalledWith(
      expect.objectContaining({ type: publicToolBrowserUnlockEventName }),
    );
  });

  it("unlocks the current browser session when local storage throws", () => {
    const dispatchEvent = vi.fn();
    vi.stubGlobal("window", {
      dispatchEvent,
      localStorage: {
        setItem: vi.fn(() => {
          throw new Error("Storage blocked");
        }),
      },
    });

    expect(setPublicToolBrowserUnlocked()).toBe(false);
    expect(publicToolBrowserUnlockMemory.isUnlocked).toBe(true);
    expect(dispatchEvent).toHaveBeenCalledOnce();
  });
});
