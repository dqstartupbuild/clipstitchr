import { describe, expect, it } from "vitest";
import { getLazyReelCorpusSnapshot } from "./getLazyReelCorpusSnapshot";

describe("getLazyReelCorpusSnapshot", () => {
  it("parses the real vendored corpus fixtures", () => {
    const snapshot = getLazyReelCorpusSnapshot();

    expect(snapshot.stats.decodedByPipeline).toBe(5_560);
    expect(snapshot.examples).toHaveLength(418);
    expect(snapshot.teardowns).toHaveLength(58);
    expect(snapshot.trendingTags).toHaveLength(1_830);
    expect(snapshot.appInsights.appsTracked?.apps?.[0]).toMatchObject({
      appName: "Notion",
      count: 3,
    });
  });
});
