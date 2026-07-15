import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { publicToolCatalog } from "@/lib/clipstitchr/tools/catalog/publicToolCatalog";
import { publicToolKeys } from "@/lib/clipstitchr/tools/catalog/publicToolKeys";

const qualityRegisterPath = fileURLToPath(
  new URL(
    "../../../../../docs/features/public-tools/portfolio/public-tool-quality-register.md",
    import.meta.url,
  ),
);

describe("public tool quality register", () => {
  it("records the required candid fields for every catalog tool", () => {
    const register = readFileSync(qualityRegisterPath, "utf8");

    expect(register).toContain("Functional proof");
    expect(register).toContain("Standalone value");
    expect(register).toContain("Paid boundary");
    expect(register).toContain("Optional intelligence");
    expect(register).toContain("Known limitation");
    expect(register).toContain("Next refinement");

    publicToolKeys.forEach((key) => {
      expect(register).toContain(`| ${publicToolCatalog[key].name} |`);
    });
  });
});
