import { describe, expect, it } from "vitest";
import { getAvatarIdentityMode } from "@/lib/clipstitchr/server/getAvatarIdentityMode";

describe("getAvatarIdentityMode", () => {
  it("accepts the similar identity mode", () => {
    expect(getAvatarIdentityMode("similar")).toBe("similar");
  });

  it("falls back to same identity mode", () => {
    expect(getAvatarIdentityMode("")).toBe("same");
    expect(getAvatarIdentityMode("custom")).toBe("same");
  });
});
