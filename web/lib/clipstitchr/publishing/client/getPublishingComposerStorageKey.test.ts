import { describe, expect, it } from "vitest";
import { getPublishingComposerStorageKey } from "@/lib/clipstitchr/publishing/client/getPublishingComposerStorageKey";

describe("getPublishingComposerStorageKey", () => {
  it("keeps browser drafts separate for each active Product", () => {
    const first = getPublishingComposerStorageKey("product_one");
    const second = getPublishingComposerStorageKey("product_two");

    expect(first).not.toBe(second);
    expect(first).toContain("product_one");
    expect(second).toContain("product_two");
  });
});
