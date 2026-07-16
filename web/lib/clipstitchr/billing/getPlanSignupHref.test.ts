import { describe, expect, it } from "vitest";
import { getPlanSignupHref } from "@/lib/clipstitchr/billing/getPlanSignupHref";

describe("getPlanSignupHref", () => {
  it("carries the selected canonical plan into account creation", () => {
    expect(getPlanSignupHref("starter")).toBe("/sign-up?plan=starter");
    expect(getPlanSignupHref("pro")).toBe("/sign-up?plan=pro");
    expect(getPlanSignupHref("agency")).toBe("/sign-up?plan=agency");
  });
});
