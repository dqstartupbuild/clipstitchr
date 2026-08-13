import { describe, expect, it } from "vitest";
import { applyStudioEditorCommand } from "./applyStudioEditorCommand";
import { createStudioEditorTestFixture } from "./test/createStudioEditorTestFixture";
import { validateStudioEditorProjectV1 } from "./validateStudioEditorProjectV1";

describe("validateStudioEditorProjectV1", () => {
  it("accepts all six supported layer kinds and all four durable source kinds", () => {
    const fixture = createStudioEditorTestFixture();
    let project = fixture.project;
    for (const [trackId, layer] of [
      ["visual_1", fixture.video],
      ["visual_1", fixture.image],
      ["visual_1", fixture.text],
      ["audio_1", fixture.voice],
      ["audio_1", fixture.music],
      ["caption_1", fixture.caption],
    ] as const) {
      project = applyStudioEditorCommand(project, {
        type: "addLayer",
        sceneId: "scene_1",
        trackId,
        index:
          project.scenes[0].tracks.find((track) => track.id === trackId)?.layers
            .length ?? 0,
        layer,
      });
    }
    const stitchVideo = {
      ...fixture.video,
      id: "video_stitch",
      source: { kind: "stitch" as const, stitchId: "stitch_1" },
    };
    project = applyStudioEditorCommand(project, {
      type: "addLayer",
      sceneId: "scene_1",
      trackId: "visual_1",
      index: 3,
      layer: stitchVideo,
    });
    expect(validateStudioEditorProjectV1(project)).toEqual([]);
  });

  it("rejects URLs, source overruns, off-frame timeline values, and incompatible tracks", () => {
    const { project, video } = createStudioEditorTestFixture();
    const invalid = structuredClone(project) as unknown as Record<
      string,
      unknown
    >;
    const scene = (invalid.scenes as Array<Record<string, unknown>>)[0];
    const tracks = scene.tracks as Array<Record<string, unknown>>;
    tracks[1].layers = [
      {
        ...video,
        startSeconds: 0.01,
        sourceDurationSeconds: 2,
        source: {
          kind: "studioUpload",
          objectKey: "https://example.com/private.mp4",
        },
      },
    ];
    const codes = validateStudioEditorProjectV1(invalid).map(
      (issue) => issue.code,
    );
    expect(codes).toEqual(
      expect.arrayContaining([
        "not_frame_aligned",
        "invalid_source",
        "source_overrun",
        "incompatible_track",
      ]),
    );
  });

  it("rejects overlapping caption cues and invalid audio fade totals", () => {
    const { project, video, caption } = createStudioEditorTestFixture();
    const invalidVideo = {
      ...video,
      audio: { ...video.audio, fadeInSeconds: 3, fadeOutSeconds: 3 },
    };
    const invalidCaption = {
      ...caption,
      cues: [caption.cues[0], { ...caption.cues[1], startSeconds: 1 }],
    };
    const invalid = {
      ...project,
      scenes: [
        {
          ...project.scenes[0],
          tracks: project.scenes[0].tracks.map((track) => ({
            ...track,
            layers:
              track.kind === "visual"
                ? [invalidVideo]
                : track.kind === "caption"
                  ? [invalidCaption]
                  : [],
          })),
        },
      ],
    };
    const codes = validateStudioEditorProjectV1(invalid).map(
      (issue) => issue.code,
    );
    expect(codes).toEqual(
      expect.arrayContaining(["overlapping_fades", "overlapping_cues"]),
    );
  });

  it("rejects fields outside the exact version-one JSON contract", () => {
    const { project } = createStudioEditorTestFixture();
    const invalid = { ...project, remoteUrl: "https://example.com/project" };
    expect(validateStudioEditorProjectV1(invalid)).toContainEqual({
      path: "remoteUrl",
      code: "unexpected_key",
      message: "This field is not part of Studio editor project version 1.",
    });
  });
});
