import { beforeEach, describe, expect, it, vi } from "vitest";
import { useHookLabIdeaLifecycleAnalytics } from "@/lib/clipstitchr/hooks/useHookLabIdeaLifecycleAnalytics";
import type { HookLabIdea } from "@/lib/clipstitchr/types/HookLabIdea";
import type { HookLabIdeaStatus } from "@/lib/clipstitchr/types/HookLabIdeaStatus";

const mocks = vi.hoisted(() => ({
  statuses: { current: new Map<string, HookLabIdeaStatus>() },
  trackHookLabLifecycleEvent: vi.fn(),
}));

vi.mock("react", () => ({
  useEffect: (effect: () => void) => effect(),
  useRef: () => mocks.statuses,
}));

vi.mock("@/lib/clipstitchr/analytics/trackHookLabLifecycleEvent", () => ({
  trackHookLabLifecycleEvent: mocks.trackHookLabLifecycleEvent,
}));

const idea: HookLabIdea = {
  createdAt: "2026-07-12T12:00:00.000Z",
  hasCreativeBeat: false,
  hasStitchRecipe: false,
  hasTextPattern: false,
  id: "idea_private_id",
  name: "Private idea",
  scope: "shared",
  sourcePlatform: "tiktok",
  sourceType: "social_link",
  status: "analyzing",
  updatedAt: "2026-07-12T12:00:00.000Z",
  useCount: 0,
};

describe("useHookLabIdeaLifecycleAnalytics", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.statuses.current = new Map();
  });

  it("captures analysis completion and failure only after observed transitions", () => {
    useHookLabIdeaLifecycleAnalytics([idea]);

    expect(mocks.trackHookLabLifecycleEvent).not.toHaveBeenCalled();

    useHookLabIdeaLifecycleAnalytics([
      {
        ...idea,
        hasCreativeBeat: true,
        hasTextPattern: true,
        status: "ready",
        updatedAt: "2026-07-12T12:01:00.000Z",
      },
    ]);
    useHookLabIdeaLifecycleAnalytics([
      {
        ...idea,
        hasCreativeBeat: true,
        hasTextPattern: true,
        status: "ready",
        updatedAt: "2026-07-12T12:01:00.000Z",
      },
    ]);

    expect(mocks.trackHookLabLifecycleEvent).toHaveBeenCalledTimes(1);
    expect(mocks.trackHookLabLifecycleEvent).toHaveBeenCalledWith({
      eventName: "hook_lab_idea_analysis_completed",
      lifecycleKey: "idea_private_id:2026-07-12T12:01:00.000Z",
      properties: {
        has_creative_beat: true,
        has_stitch_recipe: false,
        has_text_pattern: true,
        scope: "shared",
        source_platform: "tiktok",
        source_type: "social_link",
        terminal_status: "ready",
      },
    });

    useHookLabIdeaLifecycleAnalytics([
      {
        ...idea,
        updatedAt: "2026-07-12T12:02:00.000Z",
      },
    ]);
    useHookLabIdeaLifecycleAnalytics([
      {
        ...idea,
        status: "needs_attention",
        updatedAt: "2026-07-12T12:03:00.000Z",
      },
    ]);

    expect(mocks.trackHookLabLifecycleEvent).toHaveBeenLastCalledWith(
      expect.objectContaining({
        eventName: "hook_lab_idea_analysis_failed",
        lifecycleKey: "idea_private_id:2026-07-12T12:03:00.000Z",
      }),
    );
  });

  it("does not backfill terminal Ideas already present on first load", () => {
    useHookLabIdeaLifecycleAnalytics([{ ...idea, status: "ready" }]);

    expect(mocks.trackHookLabLifecycleEvent).not.toHaveBeenCalled();
  });
});
