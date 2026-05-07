import { describe, expect, it } from "vitest";
import { getUploadAssetTypeFromLibraryTab } from "@/lib/clipr/utils/getUploadAssetTypeFromLibraryTab";

describe("getUploadAssetTypeFromLibraryTab", () => {
  it("maps photos tab to photo upload type", () => {
    expect(getUploadAssetTypeFromLibraryTab("photos")).toBe("photo");
  });

  it("keeps video tabs unchanged", () => {
    expect(getUploadAssetTypeFromLibraryTab("ugc")).toBe("ugc");
    expect(getUploadAssetTypeFromLibraryTab("demo")).toBe("demo");
  });
});
