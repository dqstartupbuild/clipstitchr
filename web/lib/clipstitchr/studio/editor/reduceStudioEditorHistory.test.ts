import { describe, expect, it } from "vitest";
import { createStudioEditorHistoryState } from "./createStudioEditorHistoryState";
import { reduceStudioEditorHistory } from "./reduceStudioEditorHistory";
import { createStudioEditorTestFixture } from "./test/createStudioEditorTestFixture";

describe("reduceStudioEditorHistory", () => {
  it("undoes, redoes, clears redo after a branch, and bounds retained history", () => {
    const { project, image, text } = createStudioEditorTestFixture();
    let history = createStudioEditorHistoryState(project, 1);
    history = reduceStudioEditorHistory(history, {
      type: "execute",
      command: {
        type: "addLayer",
        sceneId: "scene_1",
        trackId: "visual_1",
        index: 0,
        layer: image,
      },
    });
    history = reduceStudioEditorHistory(history, {
      type: "execute",
      command: {
        type: "addLayer",
        sceneId: "scene_1",
        trackId: "visual_1",
        index: 1,
        layer: text,
      },
    });
    expect(history.past).toHaveLength(1);

    history = reduceStudioEditorHistory(history, { type: "undo" });
    expect(
      history.present.scenes[0].tracks[0].layers.map((layer) => layer.id),
    ).toEqual(["image_1"]);
    history = reduceStudioEditorHistory(history, { type: "redo" });
    expect(
      history.present.scenes[0].tracks[0].layers.map((layer) => layer.id),
    ).toEqual(["image_1", "text_1"]);
    history = reduceStudioEditorHistory(history, { type: "undo" });
    history = reduceStudioEditorHistory(history, {
      type: "execute",
      command: {
        type: "removeLayer",
        sceneId: "scene_1",
        trackId: "visual_1",
        layerId: "image_1",
      },
    });
    expect(history.future).toEqual([]);
    expect(reduceStudioEditorHistory(history, { type: "redo" })).toBe(history);
  });
});
