import { describe, expect, it, vi } from "vitest";
import { usePublicToolBrowserUnlock } from "@/lib/clipstitchr/tools/publicToolGates/usePublicToolBrowserUnlock";

const mocks = vi.hoisted(() => ({
  getPublicToolBrowserIsUnlocked: vi.fn(() => true),
  getPublicToolBrowserUnlockServerSnapshot: vi.fn(() => false),
  subscribePublicToolBrowserUnlock: vi.fn(),
  useSyncExternalStore: vi.fn(() => true),
}));

vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();

  return {
    ...actual,
    useSyncExternalStore: mocks.useSyncExternalStore,
  };
});

vi.mock(
  "@/lib/clipstitchr/tools/publicToolGates/getPublicToolBrowserIsUnlocked",
  () => ({
    getPublicToolBrowserIsUnlocked: mocks.getPublicToolBrowserIsUnlocked,
  }),
);

vi.mock(
  "@/lib/clipstitchr/tools/publicToolGates/getPublicToolBrowserUnlockServerSnapshot",
  () => ({
    getPublicToolBrowserUnlockServerSnapshot:
      mocks.getPublicToolBrowserUnlockServerSnapshot,
  }),
);

vi.mock(
  "@/lib/clipstitchr/tools/publicToolGates/subscribePublicToolBrowserUnlock",
  () => ({
    subscribePublicToolBrowserUnlock: mocks.subscribePublicToolBrowserUnlock,
  }),
);

describe("usePublicToolBrowserUnlock", () => {
  it("subscribes every gate to the shared browser unlock", () => {
    expect(usePublicToolBrowserUnlock()).toBe(true);
    expect(mocks.useSyncExternalStore).toHaveBeenCalledWith(
      mocks.subscribePublicToolBrowserUnlock,
      mocks.getPublicToolBrowserIsUnlocked,
      mocks.getPublicToolBrowserUnlockServerSnapshot,
    );
  });
});
