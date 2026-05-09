import { describe, expect, it } from "vitest";
import { getUploadLibraryTabFromAssetType } from "@/lib/clipstitchr/utils/getUploadLibraryTabFromAssetType";

describe("getUploadLibraryTabFromAssetType", () => {
  it("maps photo upload type to the all tab fallback", () => {
    expect(getUploadLibraryTabFromAssetType("photo")).toBe("all");
  });

  it("keeps video upload types unchanged", () => {
    expect(getUploadLibraryTabFromAssetType("ugc")).toBe("ugc");
    expect(getUploadLibraryTabFromAssetType("demo")).toBe("demo");
  });
});
