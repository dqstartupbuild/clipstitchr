import { describe, expect, it } from "vitest";
import type { Stitch } from "@/lib/clipstitchr/types/Stitch";
import { getStitchTemplateDefaultName } from "@/lib/clipstitchr/utils/getStitchTemplateDefaultName";

describe("getStitchTemplateDefaultName", () => {
  it("builds a human template name from the source stitch", () => {
    expect(
      getStitchTemplateDefaultName({
        name: "Founder hook",
      } as Stitch),
    ).toBe("Founder hook template");
  });
});
