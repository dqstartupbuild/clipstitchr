import { describe, expect, it } from "vitest";
import { applyStudioEditorCommand } from "./applyStudioEditorCommand";
import { createStudioEditorTestFixture } from "./test/createStudioEditorTestFixture";

describe("applyStudioEditorCommand", () => {
  it("adds, replaces, reorders, and removes layers without mutating prior snapshots", () => {
    const { project, image, text } = createStudioEditorTestFixture();
    const withImage = applyStudioEditorCommand(project, {
      type: "addLayer",
      sceneId: "scene_1",
      trackId: "visual_1",
      index: 0,
      layer: image,
    });
    const withText = applyStudioEditorCommand(withImage, {
      type: "addLayer",
      sceneId: "scene_1",
      trackId: "visual_1",
      index: 1,
      layer: text,
    });
    const updated = applyStudioEditorCommand(withText, {
      type: "updateLayer",
      sceneId: "scene_1",
      trackId: "visual_1",
      layer: { ...text, text: "A better hook" },
    });
    const reordered = applyStudioEditorCommand(updated, {
      type: "reorderLayer",
      sceneId: "scene_1",
      fromTrackId: "visual_1",
      toTrackId: "visual_1",
      layerId: "text_1",
      toIndex: 0,
    });
    const removed = applyStudioEditorCommand(reordered, {
      type: "removeLayer",
      sceneId: "scene_1",
      trackId: "visual_1",
      layerId: "image_1",
    });

    expect(project.scenes[0].tracks[0].layers).toEqual([]);
    expect(
      withText.scenes[0].tracks[0].layers.map((layer) => layer.id),
    ).toEqual(["image_1", "text_1"]);
    expect(
      reordered.scenes[0].tracks[0].layers.map((layer) => layer.id),
    ).toEqual(["text_1", "image_1"]);
    expect((removed.scenes[0].tracks[0].layers[0] as typeof text).text).toBe(
      "A better hook",
    );
  });

  it("snaps trims to frames and preserves explicit source trim offsets", () => {
    const { project, video } = createStudioEditorTestFixture();
    const added = applyStudioEditorCommand(project, {
      type: "addLayer",
      sceneId: "scene_1",
      trackId: "visual_1",
      index: 0,
      layer: video,
    });
    const trimmed = applyStudioEditorCommand(added, {
      type: "trimLayer",
      sceneId: "scene_1",
      trackId: "visual_1",
      layerId: "video_1",
      startSeconds: 1.01,
      durationSeconds: 2.02,
      sourceOffsetSeconds: 3.125,
    });
    const layer = trimmed.scenes[0].tracks[0].layers[0];
    expect(layer.startSeconds).toBe(1);
    expect(layer.durationSeconds).toBeCloseTo(61 / 30);
    expect(layer.sourceOffsetSeconds).toBe(3.125);
    expect(added.scenes[0].tracks[0].layers[0]).toEqual(video);
  });

  it("splits video using playback speed, preserves end fade, and inserts the right side next", () => {
    const { project, video } = createStudioEditorTestFixture();
    const fastVideo = { ...video, playbackSpeed: 2, sourceDurationSeconds: 20 };
    const added = applyStudioEditorCommand(project, {
      type: "addLayer",
      sceneId: "scene_1",
      trackId: "visual_1",
      index: 0,
      layer: fastVideo,
    });
    const split = applyStudioEditorCommand(added, {
      type: "splitLayer",
      sceneId: "scene_1",
      trackId: "visual_1",
      layerId: "video_1",
      splitSeconds: 1.99,
      rightLayerId: "video_2",
    });
    const [left, right] = split.scenes[0].tracks[0].layers;
    expect(left.durationSeconds).toBe(2);
    expect(right).toMatchObject({
      id: "video_2",
      startSeconds: 2,
      durationSeconds: 2,
      sourceOffsetSeconds: 5,
      transitionIn: { kind: "none", durationSeconds: 0 },
      audio: { fadeInSeconds: 0, fadeOutSeconds: 0.5 },
    });
  });

  it("splits and retimes caption cues on each side", () => {
    const { project, caption } = createStudioEditorTestFixture();
    const added = applyStudioEditorCommand(project, {
      type: "addLayer",
      sceneId: "scene_1",
      trackId: "caption_1",
      index: 0,
      layer: caption,
    });
    const split = applyStudioEditorCommand(added, {
      type: "splitLayer",
      sceneId: "scene_1",
      trackId: "caption_1",
      layerId: "caption_layer_1",
      splitSeconds: 3,
      rightLayerId: "caption_layer_2",
    });
    const [left, right] = split.scenes[0].tracks[2].layers;
    expect(left.kind === "caption" && left.cues).toEqual([
      caption.cues[0],
      { ...caption.cues[1], endSeconds: 3 },
    ]);
    expect(right.kind === "caption" && right.cues).toEqual([
      { ...caption.cues[1], startSeconds: 0, endSeconds: 1 },
    ]);
  });

  it("retimes caption cues when trimming from the source front", () => {
    const { project, caption } = createStudioEditorTestFixture();
    const added = applyStudioEditorCommand(project, {
      type: "addLayer",
      sceneId: "scene_1",
      trackId: "caption_1",
      index: 0,
      layer: caption,
    });
    const trimmed = applyStudioEditorCommand(added, {
      type: "trimLayer",
      sceneId: "scene_1",
      trackId: "caption_1",
      layerId: "caption_layer_1",
      startSeconds: 1,
      durationSeconds: 3,
      sourceOffsetSeconds: 1,
    });
    const layer = trimmed.scenes[0].tracks[2].layers[0];
    expect(layer.kind === "caption" && layer.cues).toEqual([
      { ...caption.cues[0], startSeconds: 0, endSeconds: 1 },
      { ...caption.cues[1], startSeconds: 1, endSeconds: 3 },
    ]);
  });

  it("rejects incompatible moves, edits on locked tracks, duplicate IDs, and edge splits", () => {
    const { project, video, voice } = createStudioEditorTestFixture();
    const withVoice = applyStudioEditorCommand(project, {
      type: "addLayer",
      sceneId: "scene_1",
      trackId: "audio_1",
      index: 0,
      layer: voice,
    });
    expect(() =>
      applyStudioEditorCommand(withVoice, {
        type: "reorderLayer",
        sceneId: "scene_1",
        fromTrackId: "audio_1",
        toTrackId: "visual_1",
        layerId: "voice_1",
        toIndex: 0,
      }),
    ).toThrow("incompatible");

    const locked = {
      ...project,
      scenes: [
        {
          ...project.scenes[0],
          tracks: project.scenes[0].tracks.map((track) =>
            track.id === "visual_1" ? { ...track, locked: true } : track,
          ),
        },
      ],
    };
    expect(() =>
      applyStudioEditorCommand(locked, {
        type: "addLayer",
        sceneId: "scene_1",
        trackId: "visual_1",
        index: 0,
        layer: video,
      }),
    ).toThrow("locked");

    const added = applyStudioEditorCommand(project, {
      type: "addLayer",
      sceneId: "scene_1",
      trackId: "visual_1",
      index: 0,
      layer: video,
    });
    expect(() =>
      applyStudioEditorCommand(added, {
        type: "addLayer",
        sceneId: "scene_1",
        trackId: "visual_1",
        index: 1,
        layer: video,
      }),
    ).toThrow("unique");
    expect(() =>
      applyStudioEditorCommand(added, {
        type: "splitLayer",
        sceneId: "scene_1",
        trackId: "visual_1",
        layerId: "video_1",
        splitSeconds: 0,
        rightLayerId: "video_2",
      }),
    ).toThrow("one frame");
  });
});
