import { existsSync, readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { publicToolCatalog } from "@/lib/clipstitchr/tools/catalog/publicToolCatalog";
import { publicToolKeys } from "@/lib/clipstitchr/tools/catalog/publicToolKeys";

const toolsDirectory = fileURLToPath(
  new URL("../../../../app/(content)/tools/", import.meta.url),
);
const featureDocsDirectory = fileURLToPath(
  new URL("../../../../../docs/features/public-tools/", import.meta.url),
);
const featureDocPaths = readdirSync(featureDocsDirectory, {
  recursive: true,
}).filter((path) => String(path).endsWith(".md"));

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
      const featureDocRelativePath = featureDocPaths.find(
        (path) =>
          String(path) === featureDocFile ||
          String(path).endsWith(`/${featureDocFile}`),
      );
      const featureDocPath = `${featureDocsDirectory}${featureDocRelativePath}`;

      expect(existsSync(routePath), `Missing route for ${key}`).toBe(true);
      expect(
        featureDocRelativePath !== undefined && existsSync(featureDocPath),
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
