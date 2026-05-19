import { describe, expect, it } from "vitest";
import { cliprHookStyleOptions } from "@/lib/clipstitchr/resources/clipr/cliprHookStyleOptions";
import { cliprHookStyles } from "@/lib/clipstitchr/resources/clipr/cliprHookStyles";

describe("cliprHookStyleOptions", () => {
  it("matches the runtime hook style names and keys", () => {
    expect(cliprHookStyleOptions).toEqual(
      cliprHookStyles.map((style) => ({
        label: style.styleName,
        value: style.styleKey,
      })),
    );
  });
});
