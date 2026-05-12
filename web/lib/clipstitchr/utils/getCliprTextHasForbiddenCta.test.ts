import { describe, expect, it } from "vitest";
import { getCliprTextHasForbiddenCta } from "@/lib/clipstitchr/utils/getCliprTextHasForbiddenCta";

describe("getCliprTextHasForbiddenCta", () => {
  it("rejects direct try instructions in generated scripts", () => {
    expect(
      getCliprTextHasForbiddenCta(
        "Try riding through small punctures and see what changes.",
      ),
    ).toBe(true);
  });

  it("allows non-CTA uses of try inside hook templates", () => {
    expect(
      getCliprTextHasForbiddenCta(
        "Most people skip this before they try {{goal}}",
      ),
    ).toBe(false);
  });
});
