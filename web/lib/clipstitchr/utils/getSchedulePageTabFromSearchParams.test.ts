import { describe, expect, it } from "vitest";
import { getSchedulePageTabFromSearchParams } from "@/lib/clipstitchr/utils/getSchedulePageTabFromSearchParams";

describe("getSchedulePageTabFromSearchParams", () => {
  it("uses posts as the default schedule tab", () => {
    expect(getSchedulePageTabFromSearchParams(new URLSearchParams())).toBe(
      "posts",
    );
    expect(
      getSchedulePageTabFromSearchParams(new URLSearchParams("tab=other")),
    ).toBe("posts");
  });

  it("allows direct links to the config/accounts tab", () => {
    expect(
      getSchedulePageTabFromSearchParams(new URLSearchParams("tab=accounts")),
    ).toBe("accounts");
  });
});
