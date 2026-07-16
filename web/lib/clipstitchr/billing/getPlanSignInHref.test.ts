import { describe, expect, it } from "vitest";
import { getPlanSignInHref } from "@/lib/clipstitchr/billing/getPlanSignInHref";

describe("getPlanSignInHref", () => {
  it("keeps the selected plan when account creation switches to sign in", () => {
    expect(getPlanSignInHref("starter")).toBe("/sign-in?plan=starter");
    expect(getPlanSignInHref("pro")).toBe("/sign-in?plan=pro");
    expect(getPlanSignInHref("agency")).toBe("/sign-in?plan=agency");
  });
});
