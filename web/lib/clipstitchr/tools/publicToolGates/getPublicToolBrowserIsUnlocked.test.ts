import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getPublicToolBrowserIsUnlocked } from "@/lib/clipstitchr/tools/publicToolGates/getPublicToolBrowserIsUnlocked";
import { publicToolBrowserUnlockMemory } from "@/lib/clipstitchr/tools/publicToolGates/publicToolBrowserUnlockMemory";
import { publicToolUnlockMarker } from "@/lib/clipstitchr/tools/publicToolGates/publicToolUnlockMarker";

describe("getPublicToolBrowserIsUnlocked", () => {
  beforeEach(() => {
    publicToolBrowserUnlockMemory.isUnlocked = false;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    publicToolBrowserUnlockMemory.isUnlocked = false;
  });

  it("returns false during server rendering", () => {
    expect(getPublicToolBrowserIsUnlocked()).toBe(false);
  });

  it("recognizes only the versioned non-identifying marker", () => {
    const getItem = vi.fn(() => publicToolUnlockMarker.value);
    vi.stubGlobal("window", { localStorage: { getItem } });

    expect(getPublicToolBrowserIsUnlocked()).toBe(true);
    expect(getItem).toHaveBeenCalledWith(publicToolUnlockMarker.key);
    expect(publicToolBrowserUnlockMemory.isUnlocked).toBe(true);
  });

  it("fails closed when local storage is unavailable", () => {
    vi.stubGlobal("window", {
      localStorage: {
        getItem: vi.fn(() => {
          throw new Error("Storage blocked");
        }),
      },
    });

    expect(getPublicToolBrowserIsUnlocked()).toBe(false);
  });

  it("keeps an accepted in-memory unlock when storage is blocked", () => {
    publicToolBrowserUnlockMemory.isUnlocked = true;
    const getItem = vi.fn();
    vi.stubGlobal("window", { localStorage: { getItem } });

    expect(getPublicToolBrowserIsUnlocked()).toBe(true);
    expect(getItem).not.toHaveBeenCalled();
  });
});
