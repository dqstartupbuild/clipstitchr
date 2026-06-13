import { describe, expect, it } from "vitest";
import type { StitchTemplate } from "@/lib/clipstitchr/types/StitchTemplate";
import { getUseStitchTemplateHref } from "@/lib/clipstitchr/utils/getUseStitchTemplateHref";

describe("getUseStitchTemplateHref", () => {
  it("links the template back to Stitchr with an encoded id", () => {
    expect(
      getUseStitchTemplateHref({
        id: "template 1",
      } as StitchTemplate),
    ).toBe("/dashboard/stitchr?templateId=template%201");
  });
});
