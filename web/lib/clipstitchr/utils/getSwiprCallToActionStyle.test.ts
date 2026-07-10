import { describe, expect, it } from "vitest";
import { getSwiprCallToActionStyle } from "@/lib/clipstitchr/utils/getSwiprCallToActionStyle";

describe("getSwiprCallToActionStyle", () => {
  it("accepts supported CTA styles", () => {
    expect(getSwiprCallToActionStyle("engagement")).toBe("engagement");
    expect(getSwiprCallToActionStyle("product")).toBe("product");
  });

  it("defaults unsupported values to any", () => {
    expect(getSwiprCallToActionStyle("viral")).toBe("any");
    expect(getSwiprCallToActionStyle(undefined)).toBe("any");
  });
});
