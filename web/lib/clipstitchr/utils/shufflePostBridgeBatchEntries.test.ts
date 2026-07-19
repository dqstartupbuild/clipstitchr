import { describe, expect, it } from "vitest";
import type { PostBridgeBatchEntry } from "@/lib/clipstitchr/types/PostBridgeBatchEntry";
import { shufflePostBridgeBatchEntries } from "@/lib/clipstitchr/utils/shufflePostBridgeBatchEntries";

function createEntry(id: string): PostBridgeBatchEntry {
  return {
    caption: id,
    item: {
      caption: id,
      id,
      renderMedia: async () => ({ hasAudio: false, mediaFiles: [] }),
      sourceType: "swipe",
      title: id,
    },
  };
}

describe("shufflePostBridgeBatchEntries", () => {
  it("returns a randomized copy without changing the submitted entries", () => {
    const entries = ["one", "two", "three", "four"].map(createEntry);
    const randomValues = [0, 0.5, 0];
    const shuffled = shufflePostBridgeBatchEntries(
      entries,
      () => randomValues.shift() ?? 0,
    );

    expect(shuffled.map(({ item }) => item.id)).toEqual([
      "three",
      "four",
      "two",
      "one",
    ]);
    expect(entries.map(({ item }) => item.id)).toEqual([
      "one",
      "two",
      "three",
      "four",
    ]);
  });

  it("never leaves a multi-item batch in newest-first input order", () => {
    const entries = ["one", "two", "three"].map(createEntry);
    const shuffled = shufflePostBridgeBatchEntries(entries, () => 0.999);

    expect(shuffled.map(({ item }) => item.id)).toEqual([
      "two",
      "three",
      "one",
    ]);
  });
});
