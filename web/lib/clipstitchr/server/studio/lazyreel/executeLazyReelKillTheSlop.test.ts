import { describe, expect, it } from "vitest";
import { executeLazyReelKillTheSlop } from "./executeLazyReelKillTheSlop";

describe("executeLazyReelKillTheSlop", () => {
  it("finds upstream anti-slop failures and returns a stable rewrite", () => {
    const request = {
      copy: "Introducing our revolutionary and game-changing review 🚀",
      tool: "kill_the_slop" as const,
    };
    const first = executeLazyReelKillTheSlop(request);
    const second = executeLazyReelKillTheSlop(request);

    expect(first).toEqual(second);
    expect(first.data.problems.join(" ")).toContain("AI-tell vocabulary");
    expect(first.data.problems.join(" ")).toContain("Brand-centric");
    expect(first.data.problems.join(" ")).toContain("Format signal");
    expect(first.data.rewrite).not.toBe(request.copy);
  });

  it("rejects empty copy", () => {
    expect(() =>
      executeLazyReelKillTheSlop({ copy: "", tool: "kill_the_slop" }),
    ).toThrow("Copy is required");
  });
});
