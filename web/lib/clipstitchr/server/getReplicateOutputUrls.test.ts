import { describe, expect, it } from "vitest";
import { getReplicateOutputUrls } from "@/lib/clipstitchr/server/getReplicateOutputUrls";

describe("getReplicateOutputUrls", () => {
  it("returns a string output URL", () => {
    expect(getReplicateOutputUrls("https://replicate.delivery/a.jpg")).toEqual([
      "https://replicate.delivery/a.jpg",
    ]);
  });

  it("flattens arrays and object URL outputs", () => {
    expect(
      getReplicateOutputUrls([
        { url: "https://replicate.delivery/a.jpg" },
        ["https://replicate.delivery/b.jpg"],
      ]),
    ).toEqual([
      "https://replicate.delivery/a.jpg",
      "https://replicate.delivery/b.jpg",
    ]);
  });

  it("returns an empty array when no URLs exist", () => {
    expect(getReplicateOutputUrls({ image: "missing" })).toEqual([]);
  });
});
