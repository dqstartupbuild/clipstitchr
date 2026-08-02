import { describe, expect, it } from "vitest";

import { getPublishingCreatePostAction } from "@/lib/clipstitchr/publishing/api/getPublishingCreatePostAction";

describe("getPublishingCreatePostAction", () => {
  it("uses a distinct assertion action for each publishing intent", () => {
    expect(getPublishingCreatePostAction("draft")).toBe(
      "publishing.posts.write",
    );
    expect(getPublishingCreatePostAction("publish-now")).toBe(
      "publishing.posts.publish",
    );
    expect(getPublishingCreatePostAction("schedule")).toBe(
      "publishing.posts.schedule",
    );
  });
});
