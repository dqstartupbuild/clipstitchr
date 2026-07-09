import { describe, expect, it } from "vitest";
import { readCliSocialAccountIds } from "@/lib/clipstitchr/server/cli/readCliSocialAccountIds";

describe("readCliSocialAccountIds", () => {
  it("keeps positive integer account IDs", () => {
    expect(
      readCliSocialAccountIds({
        socialAccountIds: [123, "456", "nope", -1, 0, 7.5],
      }),
    ).toEqual([123, 456]);
  });

  it("returns an empty list when no account IDs are provided", () => {
    expect(readCliSocialAccountIds({})).toEqual([]);
  });
});
