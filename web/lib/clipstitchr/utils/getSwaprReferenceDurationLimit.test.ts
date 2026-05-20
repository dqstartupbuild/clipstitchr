import { describe, expect, it } from "vitest";
import { getSwaprReferenceDurationLimit } from "@/lib/clipstitchr/utils/getSwaprReferenceDurationLimit";

describe("getSwaprReferenceDurationLimit", () => {
  it("uses a ninety second user-facing cap", () => {
    expect(getSwaprReferenceDurationLimit()).toBe(90);
  });
});
