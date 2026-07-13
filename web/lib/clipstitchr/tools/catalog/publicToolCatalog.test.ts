import { describe, expect, it } from "vitest";
import { publicToolCatalog } from "@/lib/clipstitchr/tools/catalog/publicToolCatalog";
import { publicToolKeys } from "@/lib/clipstitchr/tools/catalog/publicToolKeys";

describe("publicToolCatalog", () => {
  it("registers fifty unique canonical public tools", () => {
    const definitions = publicToolKeys.map((key) => publicToolCatalog[key]);
    const paths = definitions.map(({ pathname }) => pathname);

    expect(definitions).toHaveLength(50);
    expect(new Set(paths)).toHaveLength(50);
    expect(
      definitions.every(({ key }, index) => key === publicToolKeys[index]),
    ).toBe(true);
  });

  it("maps every approved portfolio number exactly once", () => {
    const portfolioNumbers = publicToolKeys.map(
      (key) => publicToolCatalog[key].portfolioNumber,
    );

    expect(portfolioNumbers).toEqual(
      Array.from({ length: 50 }, (_, index) => index + 1),
    );
    expect(new Set(portfolioNumbers)).toHaveLength(50);
  });

  it("keeps related-tool links valid and excludes self-links", () => {
    for (const definition of Object.values(publicToolCatalog)) {
      expect(definition.relatedToolKeys).toHaveLength(2);
      expect(definition.relatedToolKeys).not.toContain(definition.key);

      for (const relatedKey of definition.relatedToolKeys) {
        expect(publicToolCatalog[relatedKey]).toBeDefined();
      }
    }
  });
});
