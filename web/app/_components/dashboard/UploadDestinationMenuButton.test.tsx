import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { UploadDestinationMenuButton } from "@/app/_components/dashboard/UploadDestinationMenuButton";

const mocks = vi.hoisted(() => ({
  addEventListener: vi.fn(),
  dispatchShowUploadControlsEvent: vi.fn(),
  pathname: "/dashboard/uploads",
  push: vi.fn(),
  removeEventListener: vi.fn(),
  setStateCalls: [] as Array<ReturnType<typeof vi.fn>>,
  stateQueue: [] as unknown[],
  trackPostHogEvent: vi.fn(),
}));

vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();

  return {
    ...actual,
    useEffect: (callback: () => void | (() => void)) => callback(),
    useRef: () => ({ current: null }),
    useState: (initialValue: unknown) => {
      const value = mocks.stateQueue.length
        ? mocks.stateQueue.shift()
        : initialValue;
      const setState = vi.fn();

      mocks.setStateCalls.push(setState);

      return [value, setState];
    },
  };
});

vi.mock("next/navigation", () => ({
  usePathname: () => mocks.pathname,
  useRouter: () => ({
    push: mocks.push,
  }),
}));

vi.mock("@/lib/clipstitchr/analytics/trackPostHogEvent", () => ({
  trackPostHogEvent: mocks.trackPostHogEvent,
}));

vi.mock("@/lib/clipstitchr/utils/dispatchShowUploadControlsEvent", () => ({
  dispatchShowUploadControlsEvent: mocks.dispatchShowUploadControlsEvent,
}));

function findElements(
  value: unknown,
  predicate: (element: {
    props?: Record<string, unknown>;
    type?: unknown;
  }) => boolean,
): Array<{ props: Record<string, unknown>; type?: unknown }> {
  if (!value || typeof value !== "object") {
    return [];
  }

  if (Array.isArray(value)) {
    return value.flatMap((child) => findElements(child, predicate));
  }

  const element = value as {
    props?: { children?: unknown };
    type?: unknown;
  };
  const matches = predicate(
    element as { props?: Record<string, unknown>; type?: unknown },
  )
    ? [element as { props: Record<string, unknown>; type?: unknown }]
    : [];

  return [...matches, ...findElements(element.props?.children, predicate)];
}

describe("UploadDestinationMenuButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.pathname = "/dashboard/uploads";
    mocks.setStateCalls = [];
    mocks.stateQueue = [];
    vi.stubGlobal("window", {
      addEventListener: mocks.addEventListener,
      removeEventListener: mocks.removeEventListener,
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("tracks when the upload menu opens", () => {
    mocks.stateQueue = [false];

    const tree = UploadDestinationMenuButton();
    const [button] = findElements(
      tree,
      (element) =>
        typeof element.type === "function" && element.type.name === "Button",
    );

    (button.props.onClick as () => void)();

    expect(mocks.trackPostHogEvent).toHaveBeenCalledWith("upload_menu_opened", {
      page_path: "/dashboard/uploads",
    });
    expect(mocks.setStateCalls[0]).toHaveBeenCalledWith(expect.any(Function));
  });

  it("routes selected destinations and dispatches same-page upload controls", () => {
    mocks.stateQueue = [true];

    const tree = UploadDestinationMenuButton();
    const destinationButtons = findElements(
      tree,
      (element) =>
        element.type === "button" &&
        typeof element.props?.className === "string" &&
        String(element.props.className).includes("text-left"),
    );

    (destinationButtons[0].props.onClick as () => void)();

    expect(mocks.addEventListener).toHaveBeenCalledWith(
      "keydown",
      expect.any(Function),
    );
    expect(mocks.trackPostHogEvent).toHaveBeenCalledWith(
      "upload_destination_selected",
      expect.objectContaining({
        asset_type: "ugc",
        page_path: "/dashboard/uploads",
      }),
    );
    expect(mocks.push).toHaveBeenCalledWith(
      "/dashboard/uploads?tab=ugc&upload=open#upload-panel",
    );
    expect(mocks.dispatchShowUploadControlsEvent).toHaveBeenCalledWith("ugc");
  });
});
