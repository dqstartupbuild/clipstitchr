import { describe, expect, it } from "vitest";
import { normalizeActiveWorkerJobProgressPercent } from "@/lib/clipstitchr/utils/normalizeActiveWorkerJobProgressPercent";

describe("normalizeActiveWorkerJobProgressPercent", () => {
  it("converts fractional progress to whole-number percent values", () => {
    expect(normalizeActiveWorkerJobProgressPercent(0.68)).toBe(68);
  });

  it("keeps whole-number percent values unchanged", () => {
    expect(normalizeActiveWorkerJobProgressPercent(68)).toBe(68);
  });

  it("clamps out-of-range progress values", () => {
    expect(normalizeActiveWorkerJobProgressPercent(-0.25)).toBe(0);
    expect(normalizeActiveWorkerJobProgressPercent(150)).toBe(100);
  });

  it("ignores missing or invalid progress values", () => {
    expect(normalizeActiveWorkerJobProgressPercent()).toBeNull();
    expect(normalizeActiveWorkerJobProgressPercent(Number.NaN)).toBeNull();
  });
});
