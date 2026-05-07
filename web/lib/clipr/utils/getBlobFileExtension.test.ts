import { describe, expect, it } from "vitest";
import { getBlobFileExtension } from "@/lib/clipr/utils/getBlobFileExtension";

describe("getBlobFileExtension", () => {
  it("maps jpeg to jpg", () => {
    expect(getBlobFileExtension(new Blob([], { type: "image/jpeg" }), "bin")).toBe(
      "jpg",
    );
  });

  it("maps quicktime to mov", () => {
    expect(
      getBlobFileExtension(new Blob([], { type: "video/quicktime" }), "mp4"),
    ).toBe("mov");
  });

  it("uses fallback when the blob has no MIME type", () => {
    expect(getBlobFileExtension(new Blob([]), "mp4")).toBe("mp4");
  });
});
