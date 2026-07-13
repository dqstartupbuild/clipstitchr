import { beforeEach, describe, expect, it, vi } from "vitest";
import { defaultAppHookGeneratorInput } from "@/lib/clipstitchr/tools/appHookGenerator/defaultAppHookGeneratorInput";
import { useAppHookGenerator } from "@/lib/clipstitchr/tools/appHookGenerator/useAppHookGenerator";

const mocks = vi.hoisted(() => ({
  generateAppHooks: vi.fn(),
  requestRef: { current: null as AbortController | null },
  setStateCalls: [] as Array<ReturnType<typeof vi.fn>>,
  stateQueue: [] as unknown[],
  trackPostHogEvent: vi.fn(),
}));

vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();

  return {
    ...actual,
    useEffect: vi.fn(),
    useRef: () => mocks.requestRef,
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

vi.mock("@/lib/clipstitchr/analytics/trackPostHogEvent", () => ({
  trackPostHogEvent: mocks.trackPostHogEvent,
}));

vi.mock("@/lib/clipstitchr/tools/appHookGenerator/generateAppHooks", () => ({
  generateAppHooks: mocks.generateAppHooks,
}));

describe("useAppHookGenerator", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requestRef.current = null;
    mocks.setStateCalls = [];
    mocks.stateQueue = [defaultAppHookGeneratorInput, null, "", false];
  });

  it("does not commit a response after the visitor edits its input", async () => {
    let resolveRequest!: (value: {
      hooks: never[];
      variationIndex: number;
    }) => void;
    mocks.generateAppHooks.mockReturnValue(
      new Promise((resolve) => {
        resolveRequest = resolve;
      }),
    );
    const generator = useAppHookGenerator();
    const pendingRequest = generator.submit();
    const activeController = mocks.requestRef.current;

    generator.updateInput({
      ...defaultAppHookGeneratorInput,
      appName: "Changed App",
    });
    resolveRequest({ hooks: [], variationIndex: 0 });
    await pendingRequest;

    expect(activeController?.signal.aborted).toBe(true);
    expect(mocks.setStateCalls[0]).toHaveBeenCalledWith({
      ...defaultAppHookGeneratorInput,
      appName: "Changed App",
      variationIndex: 0,
    });
    expect(mocks.setStateCalls[1]).toHaveBeenCalledOnce();
    expect(mocks.setStateCalls[1]).toHaveBeenCalledWith(null);
    expect(mocks.trackPostHogEvent).toHaveBeenCalledOnce();
    expect(mocks.trackPostHogEvent).toHaveBeenCalledWith(
      "app_hook_generator_submitted",
      expect.any(Object),
    );
  });

  it("restarts at the first variation after editing another set", () => {
    mocks.stateQueue = [
      { ...defaultAppHookGeneratorInput, variationIndex: 9 },
      { hooks: [], variationIndex: 9 },
      "",
      false,
    ];
    const generator = useAppHookGenerator();

    generator.updateInput({
      ...defaultAppHookGeneratorInput,
      appName: "Fresh Input",
      variationIndex: 9,
    });

    expect(mocks.setStateCalls[0]).toHaveBeenCalledWith({
      ...defaultAppHookGeneratorInput,
      appName: "Fresh Input",
      variationIndex: 0,
    });
  });
});
