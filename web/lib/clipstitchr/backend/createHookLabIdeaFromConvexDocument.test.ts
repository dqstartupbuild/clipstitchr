import { describe, expect, it } from "vitest";
import { createHookLabIdeaFromConvexDocument } from "@/lib/clipstitchr/backend/createHookLabIdeaFromConvexDocument";

describe("createHookLabIdeaFromConvexDocument", () => {
  it("keeps the imported thumbnail object for authenticated loading", () => {
    const thumbnailObject = {
      contentType: "image/jpeg",
      key: "hook-lab/idea_1/thumbnail.jpg",
      size: 2048,
    };

    const idea = createHookLabIdeaFromConvexDocument({
      createdAt: "2026-07-12T12:00:00.000Z",
      id: "idea_1",
      name: "The honest before-and-after",
      scope: "shared",
      sourceType: "social_link",
      status: "ready",
      thumbnailObject,
      updatedAt: "2026-07-12T12:00:00.000Z",
      useCount: 0,
    });

    expect(idea.thumbnailObject).toBe(thumbnailObject);
  });
});
