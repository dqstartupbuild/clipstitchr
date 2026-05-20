import { afterEach, describe, expect, it, vi } from "vitest";
import { getCookieValue } from "@/lib/clipstitchr/analytics/getCookieValue";

describe("getCookieValue", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns decoded cookie values by encoded name", () => {
    vi.stubGlobal("document", {
      cookie: "other=value; clip%20id=hello%20world",
    });

    expect(getCookieValue("clip id")).toBe("hello world");
    expect(getCookieValue("missing")).toBeNull();
  });

  it("returns null without document access", () => {
    expect(getCookieValue("anything")).toBeNull();
  });
});
