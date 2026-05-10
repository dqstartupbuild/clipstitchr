import { describe, expect, it } from "vitest";
import { getCrc32 } from "@/lib/clipstitchr/utils/getCrc32";

describe("getCrc32", () => {
  it("calculates the standard CRC-32 checksum", () => {
    const bytes = new TextEncoder().encode("123456789");

    expect(getCrc32(bytes)).toBe(0xcbf43926);
  });
});
