import { describe, expect, it } from "vitest";
import { createStudioClipsDefaultEditState } from "./createStudioClipsDefaultEditState";
import { applyStudioClipsOutputEditOperation } from "./applyStudioClipsOutputEditOperation";

describe("applyStudioClipsOutputEditOperation", () => {
  const now = "2026-08-12T12:00:00.000Z";

  it("preserves independent trim, split, merge, caption, and project-style edits", () => {
    let state = createStudioClipsDefaultEditState();
    state = applyStudioClipsOutputEditOperation(
      state,
      { endSeconds: 20, kind: "trim", startSeconds: 2 },
      now,
    );
    state = applyStudioClipsOutputEditOperation(
      state,
      { kind: "split", pointsSeconds: [5, 10] },
      now,
    );
    state = applyStudioClipsOutputEditOperation(
      state,
      { kind: "merge", outputIds: ["output_1", "output_2"] },
      now,
    );
    state = applyStudioClipsOutputEditOperation(
      state,
      {
        burnIn: true,
        enabled: true,
        kind: "captions",
        languageCode: "en",
        style: { templateId: "minimal" },
      },
      now,
    );
    state = applyStudioClipsOutputEditOperation(
      state,
      { kind: "project_style", snapshotJson: '{"background":"black"}' },
      now,
    );
    expect(state).toMatchObject({
      captions: { burnIn: true, enabled: true, languageCode: "en" },
      merge: { outputIds: ["output_1", "output_2"] },
      projectStyle: { snapshotVersion: 1 },
      split: { pointsSeconds: [5, 10] },
      trim: { endSeconds: 20, startSeconds: 2 },
    });
  });

  it("records regeneration, acceptance, and sorted destination handoff intent", () => {
    let state = applyStudioClipsOutputEditOperation(
      createStudioClipsDefaultEditState(),
      { instructions: "Tighter hook", kind: "regenerate" },
      now,
    );
    state = applyStudioClipsOutputEditOperation(
      state,
      { accepted: true, kind: "accept" },
      now,
    );
    state = applyStudioClipsOutputEditOperation(
      state,
      { destination: "stitchr", kind: "handoff", state: "requested" },
      now,
    );
    state = applyStudioClipsOutputEditOperation(
      state,
      { destination: "editor", kind: "handoff", state: "requested" },
      now,
    );
    expect(state.regenerate).toEqual({
      instructions: "Tighter hook",
      state: "requested",
      updatedAt: now,
    });
    expect(state.acceptance.state).toBe("accepted");
    expect(state.handoffs.map((handoff) => handoff.destination)).toEqual([
      "editor",
      "stitchr",
    ]);
  });
});
