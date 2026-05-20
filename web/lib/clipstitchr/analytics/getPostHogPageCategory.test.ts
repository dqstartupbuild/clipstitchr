import { describe, expect, it } from "vitest";
import { getPostHogPageCategory } from "@/lib/clipstitchr/analytics/getPostHogPageCategory";

describe("getPostHogPageCategory", () => {
  it("maps known route families to analytics categories", () => {
    expect(getPostHogPageCategory("/")).toBe("landing");
    expect(getPostHogPageCategory("/dashboard/uploads")).toBe("dashboard");
    expect(getPostHogPageCategory("/sign-in")).toBe("auth_sign_in");
    expect(getPostHogPageCategory("/sign-up")).toBe("auth_sign_up");
    expect(getPostHogPageCategory("/docs/importing")).toBe("docs");
    expect(getPostHogPageCategory("/privacy")).toBe("legal");
    expect(getPostHogPageCategory("/blog")).toBe("site");
  });
});
