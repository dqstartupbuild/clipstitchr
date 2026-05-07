import { describe, expect, it } from "vitest";
import { getUploadLibraryTabFromAssetType } from "@/lib/clipr/utils/getUploadLibraryTabFromAssetType";

describe("getUploadLibraryTabFromAssetType", () => {
  it("maps photo upload type to photos tab", () => {
    expect(getUploadLibraryTabFromAssetType("photo")).toBe("photos");
  });

  it("keeps video upload types unchanged", () => {
    expect(getUploadLibraryTabFromAssetType("ugc")).toBe("ugc");
    expect(getUploadLibraryTabFromAssetType("demo")).toBe("demo");
  });
});
