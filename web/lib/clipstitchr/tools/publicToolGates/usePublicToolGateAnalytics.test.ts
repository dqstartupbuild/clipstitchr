import { beforeEach, describe, expect, it, vi } from "vitest";
import { usePublicToolGateAnalytics } from "@/lib/clipstitchr/tools/publicToolGates/usePublicToolGateAnalytics";

const mocks = vi.hoisted(() => {
  const refs: Array<{ current: boolean }> = [];
  let cursor = 0;

  return {
    beginRender: () => {
      cursor = 0;
    },
    resetRefs: () => {
      refs.length = 0;
      cursor = 0;
    },
    trackPublicToolAnalyticsEvent: vi.fn(),
    useEffect: (effect: () => void) => effect(),
    useRef: (initialValue: boolean) => {
      const index = cursor++;
      refs[index] ??= { current: initialValue };
      return refs[index];
    },
  };
});

vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();

  return {
    ...actual,
    useEffect: mocks.useEffect,
    useRef: mocks.useRef,
  };
});

vi.mock(
  "@/lib/clipstitchr/tools/publicToolGates/trackPublicToolAnalyticsEvent",
  () => ({
    trackPublicToolAnalyticsEvent: mocks.trackPublicToolAnalyticsEvent,
  }),
);

describe("usePublicToolGateAnalytics", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.resetRefs();
  });

  it("emits each lifecycle transition once with catalog-only context", () => {
    mocks.beginRender();
    usePublicToolGateAnalytics({
      isEnabled: true,
      isGateDisplayed: false,
      isResourceUnlocked: false,
      isResultDisplayed: false,
      toolKey: "app-hook-generator",
      variant: "hybrid-v1",
    });

    mocks.beginRender();
    usePublicToolGateAnalytics({
      isEnabled: true,
      isGateDisplayed: true,
      isResourceUnlocked: false,
      isResultDisplayed: true,
      toolKey: "app-hook-generator",
      variant: "hybrid-v1",
    });

    mocks.beginRender();
    usePublicToolGateAnalytics({
      isEnabled: true,
      isGateDisplayed: false,
      isResourceUnlocked: true,
      isResultDisplayed: true,
      toolKey: "app-hook-generator",
      variant: "hybrid-v1",
    });

    mocks.beginRender();
    usePublicToolGateAnalytics({
      isEnabled: true,
      isGateDisplayed: false,
      isResourceUnlocked: true,
      isResultDisplayed: true,
      toolKey: "app-hook-generator",
      variant: "hybrid-v1",
    });

    expect(mocks.trackPublicToolAnalyticsEvent.mock.calls).toEqual([
      [
        "tool_result_displayed",
        {
          gateMode: "useful-preview",
          toolKey: "app-hook-generator",
          variant: "hybrid-v1",
        },
      ],
      [
        "tool_gate_displayed",
        {
          gateMode: "useful-preview",
          toolKey: "app-hook-generator",
          variant: "hybrid-v1",
        },
      ],
      [
        "tool_resource_unlocked",
        {
          gateMode: "useful-preview",
          toolKey: "app-hook-generator",
          variant: "hybrid-v1",
        },
      ],
    ]);
    expect(JSON.stringify(mocks.trackPublicToolAnalyticsEvent.mock.calls)).not.toMatch(
      /private@example\.com|private result|visitor name/i,
    );
  });

  it("emits nothing when lifecycle tracking is disabled", () => {
    usePublicToolGateAnalytics({
      isEnabled: false,
      isGateDisplayed: true,
      isResourceUnlocked: true,
      isResultDisplayed: true,
      toolKey: "app-hook-generator",
      variant: "hybrid-v1",
    });

    expect(mocks.trackPublicToolAnalyticsEvent).not.toHaveBeenCalled();
  });
});
