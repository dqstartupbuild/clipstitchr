import { describe, expect, it } from "vitest";
import { getHookLabIdeaUseLifecycleEvent } from "@/lib/clipstitchr/analytics/getHookLabIdeaUseLifecycleEvent";

describe("getHookLabIdeaUseLifecycleEvent", () => {
  it("treats a partial use as completed when at least one Stitch is ready", () => {
    expect(getHookLabIdeaUseLifecycleEvent("completed")).toBe(
      "hook_lab_idea_use_completed",
    );
    expect(getHookLabIdeaUseLifecycleEvent("partial")).toBe(
      "hook_lab_idea_use_completed",
    );
    expect(getHookLabIdeaUseLifecycleEvent("failed")).toBe(
      "hook_lab_idea_use_failed",
    );
    expect(getHookLabIdeaUseLifecycleEvent("queued")).toBeNull();
    expect(getHookLabIdeaUseLifecycleEvent("generating")).toBeNull();
  });
});
