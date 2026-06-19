import { describe, expect, it } from "vitest";
import { getLibraryTabFromAssetType } from "@/lib/clipstitchr/utils/getLibraryTabFromAssetType";

describe("getLibraryTabFromAssetType", () => {
  it("maps photo upload type to the avatars tab", () => {
    expect(getLibraryTabFromAssetType("photo")).toBe("avatars");
  });

  it("keeps video upload types unchanged", () => {
    expect(getLibraryTabFromAssetType("ugc")).toBe("ugc");
    expect(getLibraryTabFromAssetType("demo")).toBe("demo");
  });
});
