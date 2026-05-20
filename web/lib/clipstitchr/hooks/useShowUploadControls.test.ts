import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { HIDE_UPLOAD_CONTROLS_EVENT_NAME } from "@/lib/clipstitchr/constants/hideUploadControlsEventName";
import { SHOW_UPLOAD_CONTROLS_EVENT_NAME } from "@/lib/clipstitchr/constants/showUploadControlsEventName";
import { useShowUploadControls } from "@/lib/clipstitchr/hooks/useShowUploadControls";

const mocks = vi.hoisted(() => ({
  cleanups: [] as Array<() => void>,
  stateSetter: vi.fn(),
}));

vi.mock("react", () => ({
  useEffect: (callback: () => void | (() => void)) => {
    const cleanup = callback();

    if (typeof cleanup === "function") {
      mocks.cleanups.push(cleanup);
    }
  },
  useState: (initialValue: boolean) => [initialValue, mocks.stateSetter],
}));

type ListenerMap = Map<string, EventListener>;

function stubWindow(hash = "", search = "") {
  const listeners: ListenerMap = new Map();
  const windowStub = {
    addEventListener: vi.fn((eventName: string, listener: EventListener) => {
      listeners.set(eventName, listener);
    }),
    location: {
      hash,
      search,
    },
    removeEventListener: vi.fn(),
  };

  vi.stubGlobal("window", windowStub);

  return {
    listeners,
    windowStub,
  };
}

describe("useShowUploadControls", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.cleanups = [];
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("syncs initial URL state and listens for URL changes", () => {
    const { listeners, windowStub } = stubWindow("#upload-panel", "");

    const showUploadControls = useShowUploadControls();

    expect(showUploadControls).toBe(false);
    expect(mocks.stateSetter).toHaveBeenCalledWith(true);
    expect(windowStub.addEventListener).toHaveBeenCalledWith(
      "hashchange",
      expect.any(Function),
    );
    expect(windowStub.addEventListener).toHaveBeenCalledWith(
      "popstate",
      expect.any(Function),
    );

    windowStub.location.hash = "";
    windowStub.location.search = "?upload=open";
    listeners.get("popstate")?.(new Event("popstate"));

    expect(mocks.stateSetter).toHaveBeenLastCalledWith(true);
  });

  it("responds to upload control events and removes listeners during cleanup", () => {
    const { listeners, windowStub } = stubWindow();

    useShowUploadControls();

    listeners.get(SHOW_UPLOAD_CONTROLS_EVENT_NAME)?.(
      new Event(SHOW_UPLOAD_CONTROLS_EVENT_NAME),
    );
    expect(mocks.stateSetter).toHaveBeenLastCalledWith(true);

    listeners.get(HIDE_UPLOAD_CONTROLS_EVENT_NAME)?.(
      new Event(HIDE_UPLOAD_CONTROLS_EVENT_NAME),
    );
    expect(mocks.stateSetter).toHaveBeenLastCalledWith(false);

    mocks.cleanups[0]();

    expect(windowStub.removeEventListener).toHaveBeenCalledWith(
      "hashchange",
      expect.any(Function),
    );
    expect(windowStub.removeEventListener).toHaveBeenCalledWith(
      "popstate",
      expect.any(Function),
    );
    expect(windowStub.removeEventListener).toHaveBeenCalledWith(
      HIDE_UPLOAD_CONTROLS_EVENT_NAME,
      expect.any(Function),
    );
    expect(windowStub.removeEventListener).toHaveBeenCalledWith(
      SHOW_UPLOAD_CONTROLS_EVENT_NAME,
      expect.any(Function),
    );
  });
});
