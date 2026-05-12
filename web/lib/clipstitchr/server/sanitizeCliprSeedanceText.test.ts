import { describe, expect, it } from "vitest";
import { sanitizeCliprSeedanceText } from "@/lib/clipstitchr/server/sanitizeCliprSeedanceText";

describe("sanitizeCliprSeedanceText", () => {
  it("removes fitness and body-results phrasing before Seedance", () => {
    expect(
      sanitizeCliprSeedanceText(
        "Home gym with exercise mat. Winging your workouts slows results you can see.",
      ),
    ).toBe(
      "bright living room with small side table. Winging your daily routines slows clearer progress over time.",
    );
  });
});
