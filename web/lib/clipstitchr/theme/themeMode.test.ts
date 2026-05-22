import { afterEach, describe, expect, it, vi } from "vitest";
import { applyThemeMode } from "@/lib/clipstitchr/theme/applyThemeMode";
import { isThemeMode } from "@/lib/clipstitchr/theme/isThemeMode";
import { readStoredThemeMode } from "@/lib/clipstitchr/theme/readStoredThemeMode";
import { themeModeStorageKey } from "@/lib/clipstitchr/theme/themeModeStorageKey";
import { writeStoredThemeMode } from "@/lib/clipstitchr/theme/writeStoredThemeMode";

describe("theme mode helpers", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("validates supported theme modes", () => {
    expect(isThemeMode("system")).toBe(true);
    expect(isThemeMode("light")).toBe(true);
    expect(isThemeMode("dark")).toBe(true);
    expect(isThemeMode("auto")).toBe(false);
  });

  it("reads and writes stored theme preferences", () => {
    const storage = new Map<string, string>();

    vi.stubGlobal("window", {
      localStorage: {
        getItem: (key: string) => storage.get(key) ?? null,
        removeItem: (key: string) => storage.delete(key),
        setItem: (key: string, value: string) => storage.set(key, value),
      },
    });

    expect(readStoredThemeMode()).toBe("system");

    writeStoredThemeMode("dark");

    expect(storage.get(themeModeStorageKey)).toBe("dark");
    expect(readStoredThemeMode()).toBe("dark");

    writeStoredThemeMode("system");

    expect(storage.has(themeModeStorageKey)).toBe(false);
  });

  it("applies system and explicit theme attributes", () => {
    const attributes = new Map<string, string>();
    const dataset: Record<string, string> = {};

    vi.stubGlobal("document", {
      documentElement: {
        dataset,
        removeAttribute: (name: string) => {
          attributes.delete(name);
          delete dataset.theme;
        },
        setAttribute: (name: string, value: string) => {
          attributes.set(name, value);
        },
      },
    });

    applyThemeMode("dark");

    expect(dataset.themeMode).toBe("dark");
    expect(dataset.theme).toBe("dark");

    applyThemeMode("system");

    expect(dataset.themeMode).toBe("system");
    expect(dataset.theme).toBeUndefined();
  });
});
