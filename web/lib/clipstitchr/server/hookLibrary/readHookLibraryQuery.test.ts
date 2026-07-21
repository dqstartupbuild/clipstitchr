import { describe, expect, it } from "vitest";
import { readHookLibraryQuery } from "./readHookLibraryQuery";

describe("readHookLibraryQuery", () => {
  it("reads bounded supported filters", () => {
    expect(
      readHookLibraryQuery(
        "https://clipstitchr.test/api/hook-lab/templates?q=mistake&category=cost_alert&page=3&purpose=stitchr&risk=medium&trigger=loss%20aversion",
      ),
    ).toEqual({
      category: "cost_alert",
      page: 3,
      purpose: "stitchr",
      query: "mistake",
      risk: "medium",
      trigger: "loss aversion",
    });
  });

  it("falls back safely for unsupported values", () => {
    expect(
      readHookLibraryQuery(
        "https://clipstitchr.test/api/hook-lab/templates?page=-2&purpose=unknown&risk=extreme",
      ),
    ).toEqual({
      category: undefined,
      page: 1,
      purpose: undefined,
      query: undefined,
      risk: undefined,
      trigger: undefined,
    });
  });
});
