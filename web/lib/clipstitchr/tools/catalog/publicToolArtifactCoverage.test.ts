import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { publicToolCatalog } from "@/lib/clipstitchr/tools/catalog/publicToolCatalog";
import { publicToolKeys } from "@/lib/clipstitchr/tools/catalog/publicToolKeys";

const toolsDirectory = fileURLToPath(
  new URL("../../../../app/(content)/tools/", import.meta.url),
);
const featureDocsDirectory = fileURLToPath(
  new URL("../../../../../docs/features/", import.meta.url),
);

const featureDocFileOverrides = {
  "app-ad-hook-structures": "50-app-ad-hook-structures.md",
} as const;

describe("public tool artifact coverage", () => {
  it("keeps a physical route and dedicated feature document for all fifty catalog entries", () => {
    for (const key of publicToolKeys) {
      const routePath = `${toolsDirectory}${key}/page.tsx`;
      const featureDocFile =
        featureDocFileOverrides[key as keyof typeof featureDocFileOverrides] ??
        `${key}.md`;
      const featureDocPath = `${featureDocsDirectory}${featureDocFile}`;

      expect(existsSync(routePath), `Missing route for ${key}`).toBe(true);
      expect(
        existsSync(featureDocPath),
        `Missing feature document for ${key}`,
      ).toBe(true);
      expect(readFileSync(featureDocPath, "utf8")).toContain(
        "public-tool-quality-register.md",
      );
      expect(readFileSync(routePath, "utf8")).toContain(
        publicToolCatalog[key].pathname.split("/").at(-1),
      );
    }
  });
});
