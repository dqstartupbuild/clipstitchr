import { describe, expect, it } from "vitest";
import { sanitizeClipNameToken } from "@/lib/clipstitchr/tools/clipNamingSystem/sanitizeClipNameToken";

describe("sanitizeClipNameToken", () => {
  it("removes invalid filename characters and collapses whitespace", () => {
    expect(sanitizeClipNameToken('  Démo: "One" / Final?* ', "-")).toBe(
      "demo-one-final",
    );
  });

  it("returns a visible fallback for an empty or invalid token", () => {
    expect(sanitizeClipNameToken("<>:*?", "_")).toBe("untitled");
  });
});
