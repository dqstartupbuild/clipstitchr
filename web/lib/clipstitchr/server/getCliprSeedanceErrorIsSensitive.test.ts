import { describe, expect, it } from "vitest";
import { getCliprSeedanceErrorIsSensitive } from "@/lib/clipstitchr/server/getCliprSeedanceErrorIsSensitive";

describe("getCliprSeedanceErrorIsSensitive", () => {
  it("matches Seedance E005 moderation failures", () => {
    expect(
      getCliprSeedanceErrorIsSensitive(
        "ModelError: The input or output was flagged as sensitive. (E005)",
      ),
    ).toBe(true);
  });

  it("does not match unrelated provider failures", () => {
    expect(getCliprSeedanceErrorIsSensitive("Prediction timed out")).toBe(false);
  });
});
