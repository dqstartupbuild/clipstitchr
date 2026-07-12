import { beforeEach, describe, expect, it, vi } from "vitest";
import { useHookLabIdeaUseLifecycleAnalytics } from "@/lib/clipstitchr/hooks/useHookLabIdeaUseLifecycleAnalytics";
import type { HookLabIdeaUseStatus } from "@/lib/clipstitchr/types/HookLabIdeaUseStatus";

const mocks = vi.hoisted(() => ({
  previousProgress: {
    current: null as { id: string; status: HookLabIdeaUseStatus } | null,
  },
  trackHookLabLifecycleEvent: vi.fn(),
}));

vi.mock("react", () => ({
  useEffect: (effect: () => void) => effect(),
  useRef: () => mocks.previousProgress,
}));

vi.mock("@/lib/clipstitchr/analytics/trackHookLabLifecycleEvent", () => ({
  trackHookLabLifecycleEvent: mocks.trackHookLabLifecycleEvent,
}));

describe("useHookLabIdeaUseLifecycleAnalytics", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.previousProgress.current = null;
  });

  it("captures an observed terminal use once", () => {
    const queuedProgress = {
      completedVariantCount: 0,
      failedVariantCount: 0,
      id: "use_1",
      progress: 0,
      status: "queued" as const,
      variationCount: 1,
      variants: [],
    };
    const completedProgress = {
      ...queuedProgress,
      completedVariantCount: 1,
      progress: 1,
      status: "completed" as const,
    };

    useHookLabIdeaUseLifecycleAnalytics(queuedProgress);
    useHookLabIdeaUseLifecycleAnalytics(completedProgress);
    useHookLabIdeaUseLifecycleAnalytics(completedProgress);

    expect(mocks.trackHookLabLifecycleEvent).toHaveBeenCalledTimes(1);
    expect(mocks.trackHookLabLifecycleEvent).toHaveBeenCalledWith({
      eventName: "hook_lab_idea_use_completed",
      lifecycleKey: "use_1",
      properties: {
        completed_variant_count: 1,
        failed_variant_count: 0,
        is_partial: false,
        terminal_status: "completed",
        variation_count: 1,
      },
    });
  });

  it("captures a fast initial failure and a different subsequent use", () => {
    useHookLabIdeaUseLifecycleAnalytics({
      completedVariantCount: 0,
      failedVariantCount: 1,
      id: "use_1",
      progress: 1,
      status: "failed",
      variationCount: 1,
      variants: [],
    });
    useHookLabIdeaUseLifecycleAnalytics({
      completedVariantCount: 1,
      failedVariantCount: 0,
      id: "use_2",
      progress: 1,
      status: "completed",
      variationCount: 1,
      variants: [],
    });

    expect(mocks.trackHookLabLifecycleEvent).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        eventName: "hook_lab_idea_use_failed",
        lifecycleKey: "use_1",
      }),
    );
    expect(mocks.trackHookLabLifecycleEvent).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        eventName: "hook_lab_idea_use_completed",
        lifecycleKey: "use_2",
      }),
    );
  });
});
