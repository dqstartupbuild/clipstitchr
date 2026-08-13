import { describe, expect, it } from "vitest";
import { getStudioBetaGlobalEnabled } from "./getStudioBetaGlobalEnabled";

describe("getStudioBetaGlobalEnabled", () => {
  it("accepts only the exact string true", () => {
    expect(getStudioBetaGlobalEnabled("true")).toBe(true);
    expect(getStudioBetaGlobalEnabled("TRUE")).toBe(false);
    expect(getStudioBetaGlobalEnabled(" true ")).toBe(false);
    expect(getStudioBetaGlobalEnabled("1")).toBe(false);
    expect(getStudioBetaGlobalEnabled(undefined)).toBe(false);
  });
});
