import { describe, expect, it } from "vitest";
import { filterCollectionResourceItems } from "@/lib/clipstitchr/tools/resources/filterCollectionResourceItems";

const items = [
  {
    body: "Show the first product action.",
    category: "Demo",
    copyText: "Watch what happens when I tap this.",
    eyebrow: "Demo-first",
    id: "demo",
    tags: ["product"],
    title: "Start with the tap",
  },
  {
    body: "Name the audience problem.",
    category: "Problem",
    copyText: "Still losing track of every task?",
    eyebrow: "Problem-first",
    id: "problem",
    tags: ["pain"],
    title: "Name the friction",
  },
];

describe("filterCollectionResourceItems", () => {
  it("filters by category and searchable card details", () => {
    expect(filterCollectionResourceItems(items, "Demo", "tap")).toEqual([
      items[0],
    ]);
    expect(filterCollectionResourceItems(items, "All", "pain")).toEqual([
      items[1],
    ]);
    expect(filterCollectionResourceItems(items, "Problem", "tap")).toEqual([]);
  });
});
