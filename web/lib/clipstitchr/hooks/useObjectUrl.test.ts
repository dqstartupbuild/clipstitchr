import { beforeEach, describe, expect, it, vi } from "vitest";
import { useObjectUrl } from "@/lib/clipstitchr/hooks/useObjectUrl";

const mocks = vi.hoisted(() => ({
  cleanupFns: [] as Array<() => void>,
  setUrl: vi.fn(),
  stateValue: null as string | null,
  useEffect: vi.fn(),
  useState: vi.fn(),
}));

vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();

  return {
    ...actual,
    useEffect: mocks.useEffect,
    useState: mocks.useState,
  };
});

describe("useObjectUrl", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.cleanupFns = [];
    mocks.stateValue = null;
    mocks.useEffect.mockImplementation((effect: () => void | (() => void)) => {
      const cleanup = effect();

      if (typeof cleanup === "function") {
        mocks.cleanupFns.push(cleanup);
      }
    });
    mocks.useState.mockImplementation((initialValue: string | null) => [
      mocks.stateValue ?? initialValue,
      mocks.setUrl,
    ]);
    vi.stubGlobal("URL", {
      createObjectURL: vi.fn(() => "blob:created"),
      revokeObjectURL: vi.fn(),
    });
  });

  it("clears the current URL when no blob is available", async () => {
    expect(useObjectUrl(null)).toBeNull();

    await Promise.resolve();

    expect(mocks.setUrl).toHaveBeenCalledWith(null);
    expect(URL.createObjectURL).not.toHaveBeenCalled();

    vi.unstubAllGlobals();
  });

  it("creates, publishes, and revokes object URLs for blobs", async () => {
    const blob = new Blob(["video"]);

    expect(useObjectUrl(blob)).toBeNull();

    expect(URL.createObjectURL).toHaveBeenCalledWith(blob);

    await Promise.resolve();

    expect(mocks.setUrl).toHaveBeenCalledWith("blob:created");

    mocks.cleanupFns[0]();

    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:created");

    vi.unstubAllGlobals();
  });

  it("does not publish a URL after cleanup deactivates the effect", async () => {
    useObjectUrl(new Blob(["poster"]));

    mocks.cleanupFns[0]();
    await Promise.resolve();

    expect(mocks.setUrl).not.toHaveBeenCalledWith("blob:created");
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:created");

    vi.unstubAllGlobals();
  });
});
