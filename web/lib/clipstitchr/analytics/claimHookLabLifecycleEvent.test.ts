import { afterEach, describe, expect, it, vi } from "vitest";
import { claimHookLabLifecycleEvent } from "@/lib/clipstitchr/analytics/claimHookLabLifecycleEvent";

describe("claimHookLabLifecycleEvent", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("claims each lifecycle once per browser tab session", () => {
    const values = new Map<string, string>();

    vi.stubGlobal("window", {
      sessionStorage: {
        getItem: (key: string) => values.get(key) ?? null,
        setItem: (key: string, value: string) => values.set(key, value),
      },
    });

    expect(
      claimHookLabLifecycleEvent(
        "hook_lab_idea_analysis_completed",
        "idea_1:attempt_1",
      ),
    ).toBe(true);
    expect(
      claimHookLabLifecycleEvent(
        "hook_lab_idea_analysis_completed",
        "idea_1:attempt_1",
      ),
    ).toBe(false);
    expect(
      claimHookLabLifecycleEvent(
        "hook_lab_idea_analysis_failed",
        "idea_1:attempt_1",
      ),
    ).toBe(true);
  });

  it("does not claim lifecycle events during server rendering", () => {
    vi.stubGlobal("window", undefined);

    expect(
      claimHookLabLifecycleEvent(
        "hook_lab_idea_use_completed",
        "use_1",
      ),
    ).toBe(false);
  });
});
