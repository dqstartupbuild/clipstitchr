import { describe, expect, it } from "vitest";
import { formatHookLabPromptMemory } from "@/lib/clipstitchr/server/formatHookLabPromptMemory";

describe("formatHookLabPromptMemory", () => {
  it("shares the reusable structure without exposing the raw source text", () => {
    const result = formatHookLabPromptMemory([
      {
        cadence: "Short setup, then a reveal.",
        claimsRequiringSupport: [],
        emotionalJob: "Create recognition.",
        exactReuseConstraints: ["The visual must resolve the reference."],
        productSpecificTokens: ["OtherBrand"],
        reusablePattern: "If your {task} looks like this…",
        semanticSlots: [{ meaning: "The viewer's task", name: "task" }],
        sourceText: "Private source wording should stay out of prompt memory.",
        unresolvedVisualReferences: ["this"],
      },
    ]);

    expect(result).toContain("If your {task} looks like this");
    expect(result).toContain("Create recognition");
    expect(result).not.toContain("Private source wording");
  });
});
