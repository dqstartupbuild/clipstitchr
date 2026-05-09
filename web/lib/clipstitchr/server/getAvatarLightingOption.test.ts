import { describe, expect, it } from "vitest";
import { getAvatarLightingOption } from "@/lib/clipstitchr/server/getAvatarLightingOption";

describe("getAvatarLightingOption", () => {
  it("accepts supported lighting options", () => {
    expect(getAvatarLightingOption("any")).toBe("any");
    expect(getAvatarLightingOption("natural")).toBe("natural");
    expect(getAvatarLightingOption("studio")).toBe("studio");
    expect(getAvatarLightingOption("golden-hour")).toBe("golden-hour");
    expect(getAvatarLightingOption("night")).toBe("night");
    expect(getAvatarLightingOption("dramatic")).toBe("dramatic");
  });

  it("falls back to any lighting", () => {
    expect(getAvatarLightingOption("")).toBe("any");
    expect(getAvatarLightingOption("custom")).toBe("any");
  });
});
