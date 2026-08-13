import { describe, expect, it } from "vitest";
import { getLazyReelResearchCatalog } from "./getLazyReelResearchCatalog";
import { lazyReelSnapshotVersion } from "./lazyReelSnapshotVersion";

describe("getLazyReelResearchCatalog", () => {
  it("returns deterministic, corpus-grounded browse facets", () => {
    const catalog = getLazyReelResearchCatalog();

    expect(catalog.snapshotVersion).toBe(lazyReelSnapshotVersion);
    expect(catalog.niches).toContain("skincare");
    expect(catalog.formats).toContain("talking-head");
    expect(catalog.hookPatterns).toHaveLength(13);
    expect(catalog.frameworks).toHaveLength(12);
    expect(catalog.tools).toHaveLength(7);
    expect(catalog.wikiDocuments).toHaveLength(24);
    expect(catalog.wikiDocuments[0]).toMatchObject({
      kind: "niche",
      slug: "abg-beauty",
      sourcePath: "wiki/niches/abg-beauty.md",
    });
    expect(catalog.wikiDocuments.at(-1)).toMatchObject({
      kind: "pattern",
      slug: "speed-of-claim",
    });
    expect(catalog.wikiDocuments.every((document) => document.content.startsWith("# "))).toBe(
      true,
    );
    expect(catalog.counts).toMatchObject({
      decodedVideosClaimed: 5_560,
      exampleLinks: 418,
      teardowns: 58,
    });
    expect(catalog.niches).toEqual([...catalog.niches].sort((left, right) => left.localeCompare(right)));
  });
});
