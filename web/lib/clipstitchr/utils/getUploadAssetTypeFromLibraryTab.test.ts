import { describe, expect, it } from "vitest";
import { getUploadAssetTypeFromLibraryTab } from "@/lib/clipstitchr/utils/getUploadAssetTypeFromLibraryTab";

describe("getUploadAssetTypeFromLibraryTab", () => {
  it("keeps video tabs unchanged", () => {
    expect(getUploadAssetTypeFromLibraryTab("ugc")).toBe("ugc");
    expect(getUploadAssetTypeFromLibraryTab("demo")).toBe("demo");
  });

  it("uses ugc as the upload default for non-upload tabs", () => {
    expect(getUploadAssetTypeFromLibraryTab("all")).toBe("ugc");
    expect(getUploadAssetTypeFromLibraryTab("swaps")).toBe("ugc");
    expect(getUploadAssetTypeFromLibraryTab("swipes")).toBe("ugc");
    expect(getUploadAssetTypeFromLibraryTab("stitches")).toBe("ugc");
  });
});
