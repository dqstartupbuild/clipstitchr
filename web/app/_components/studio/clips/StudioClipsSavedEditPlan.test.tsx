import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { StudioClipsSavedEditPlan } from "./StudioClipsSavedEditPlan";

describe("StudioClipsSavedEditPlan", () => {
  it("shows the complete bounded edit plan without slicing split points or instructions", () => {
    const markup = renderToStaticMarkup(
      <StudioClipsSavedEditPlan
        output={{
          artifactId: "artifact_1",
          contentType: "video/mp4",
          createdAt: "2026-08-12T10:00:00.000Z",
          edit: {
            acceptance: { state: "pending" },
            captions: { burnIn: true, enabled: true },
            handoffs: [],
            regenerate: {
              instructions: "Keep the full explanation and move the hook earlier.",
              state: "requested",
            },
            split: { pointsSeconds: [5, 10, 15, 20] },
            trim: { endSeconds: 25, startSeconds: 2 },
            version: 1,
          },
          id: "output_1",
          objectKey: "users/owner/studio/v1/media-output/output.mp4",
          productId: "product_1",
          revision: 4,
          sha256: "a".repeat(64),
          sizeBytes: 100,
          taskId: "task_1",
          updatedAt: "2026-08-12T10:00:00.000Z",
        }}
      />,
    );

    expect(markup).toContain("0:05, 0:10, 0:15, 0:20");
    expect(markup).toContain(
      "Keep the full explanation and move the hook earlier.",
    );
    expect(markup).toContain("On and burned in");
  });
});
