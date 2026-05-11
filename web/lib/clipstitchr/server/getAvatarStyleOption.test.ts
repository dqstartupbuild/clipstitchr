import { describe, expect, it } from "vitest";
import { getAvatarStyleOption } from "@/lib/clipstitchr/server/getAvatarStyleOption";

describe("getAvatarStyleOption", () => {
  it("accepts supported style options", () => {
    expect(getAvatarStyleOption("ugc")).toBe("ugc");
    expect(getAvatarStyleOption("selfie")).toBe("selfie");
    expect(getAvatarStyleOption("photo")).toBe("photo");
    expect(getAvatarStyleOption("candid")).toBe("candid");
    expect(getAvatarStyleOption("editorial")).toBe("editorial");
    expect(getAvatarStyleOption("travel")).toBe("travel");
    expect(getAvatarStyleOption("cinematic")).toBe("cinematic");
  });

  it("falls back to UGC style", () => {
    expect(getAvatarStyleOption("")).toBe("ugc");
    expect(getAvatarStyleOption("custom")).toBe("ugc");
  });
});
