import { describe, expect, it } from "vitest";
import type { Doc } from "@/convex/_generated/dataModel";
import { createStitchTemplateFromConvexDocument } from "@/lib/clipstitchr/backend/createStitchTemplateFromConvexDocument";

describe("createStitchTemplateFromConvexDocument", () => {
  it("maps a Convex stitch template document to the client template shape", () => {
    const template = createStitchTemplateFromConvexDocument({
      _creationTime: 1,
      _id: "template_doc_id",
      createdAt: "2026-06-13T00:00:00.000Z",
      demoClipId: "demo_1",
      demoClipName: "Demo",
      demoPlaybackRate: 2,
      demoTrimRange: { start: 1, end: 5 },
      duration: 16,
      height: 1920,
      id: "template_1",
      includeDemoAudio: true,
      includeUgcAudio: false,
      mode: "normal",
      name: "Hook template",
      ownerId: "owner_1",
      sourceStitchId: "stitch_1",
      sourceStitchName: "Original stitch",
      textOverlays: [
        {
          endTime: 3,
          fontSize: 42,
          startTime: 0,
          styleId: "classic",
          text: "Try this",
          width: 80,
          x: 10,
          y: 20,
        },
      ],
      ugcClipId: "ugc_1",
      ugcClipName: "UGC",
      ugcPlaybackRate: 1,
      ugcTrimRange: { start: 0, end: 8 },
      updatedAt: "2026-06-13T00:00:00.000Z",
      width: 1080,
    } as unknown as Doc<"stitchTemplates">);

    expect(template).toMatchObject({
      demoClipId: "demo_1",
      demoPlaybackRate: 2,
      id: "template_1",
      includeDemoAudio: true,
      name: "Hook template",
      sourceStitchId: "stitch_1",
      textOverlays: [
        {
          text: "Try this",
        },
      ],
      ugcClipId: "ugc_1",
    });
  });
});
