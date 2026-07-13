import { describe, expect, it } from "vitest";
import { getAppHookGeneratorTraitFill } from "@/lib/clipstitchr/tools/appHookGenerator/server/getAppHookGeneratorTraitFill";

describe("getAppHookGeneratorTraitFill", () => {
  it("keeps verb and noun-phrase outcomes grammatical", () => {
    expect(
      getAppHookGeneratorTraitFill("APP-041", "launch more ad variations"),
    ).toBe("wants this result: launch more ad variations");
    expect(
      getAppHookGeneratorTraitFill("APP-042", "reliable investment planning"),
    ).toBe("this is the result you want: reliable investment planning");
    expect(
      getAppHookGeneratorTraitFill("APP-283", "a calmer care routine"),
    ).toBe("want this result: a calmer care routine");
  });
});
