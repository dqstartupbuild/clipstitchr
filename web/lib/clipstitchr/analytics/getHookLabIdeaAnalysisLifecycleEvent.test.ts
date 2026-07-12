import { describe, expect, it } from "vitest";
import { getHookLabIdeaAnalysisLifecycleEvent } from "@/lib/clipstitchr/analytics/getHookLabIdeaAnalysisLifecycleEvent";

describe("getHookLabIdeaAnalysisLifecycleEvent", () => {
  it("maps only observed analysis terminal transitions", () => {
    expect(
      getHookLabIdeaAnalysisLifecycleEvent("analyzing", "ready"),
    ).toBe("hook_lab_idea_analysis_completed");
    expect(
      getHookLabIdeaAnalysisLifecycleEvent("analyzing", "failed"),
    ).toBe("hook_lab_idea_analysis_failed");
    expect(
      getHookLabIdeaAnalysisLifecycleEvent("analyzing", "needs_attention"),
    ).toBe("hook_lab_idea_analysis_failed");
    expect(getHookLabIdeaAnalysisLifecycleEvent("ready", "ready")).toBeNull();
    expect(
      getHookLabIdeaAnalysisLifecycleEvent("failed", "analyzing"),
    ).toBeNull();
  });
});
