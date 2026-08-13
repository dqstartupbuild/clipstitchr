import type { StudioEditorValidationIssue } from "../../types/studioEditor/StudioEditorValidationIssue";
import type { StudioEditorValidationContext } from "../../types/studioEditor/StudioEditorValidationContext";
import { addStudioEditorValidationIssue } from "./addStudioEditorValidationIssue";
import { addStudioEditorUnexpectedKeyIssues } from "./addStudioEditorUnexpectedKeyIssues";
import { isStudioEditorDurableRef } from "./isStudioEditorDurableRef";
import { isStudioEditorFrameAligned } from "./isStudioEditorFrameAligned";
import { isFiniteStudioEditorNumber } from "./isFiniteStudioEditorNumber";
import { isStudioEditorLayerCompatibleWithTrack } from "./isStudioEditorLayerCompatibleWithTrack";
import { isStudioEditorRecord } from "./isStudioEditorRecord";
import { STUDIO_EDITOR_PROJECT_VERSION } from "./studioEditorProjectVersion";
import { validateStudioEditorAudioSettings } from "./validateStudioEditorAudioSettings";
import { validateStudioEditorCaptionLayer } from "./validateStudioEditorCaptionLayer";
import { validateStudioEditorCrop } from "./validateStudioEditorCrop";
import { validateStudioEditorTextStyle } from "./validateStudioEditorTextStyle";
import { validateStudioEditorTransform } from "./validateStudioEditorTransform";
import { validateStudioEditorTransition } from "./validateStudioEditorTransition";
import { validateStudioEditorBoundedNumber } from "./validateStudioEditorBoundedNumber";
import { validateStudioEditorBoundedString } from "./validateStudioEditorBoundedString";

const layerKinds = new Set([
  "video",
  "image",
  "text",
  "voice",
  "music",
  "caption",
]);
const trackKinds = new Set(["visual", "audio", "caption"]);
export function validateStudioEditorProjectV1(
  value: unknown,
): StudioEditorValidationIssue[] {
  const issues: StudioEditorValidationIssue[] = [];
  const add = addStudioEditorValidationIssue.bind(null, issues);
  const finite = isFiniteStudioEditorNumber;
  const boundedString = validateStudioEditorBoundedString.bind(
    null,
    issues,
  ) as StudioEditorValidationContext["boundedString"];
  const boundedNumber = validateStudioEditorBoundedNumber.bind(
    null,
    issues,
  ) as StudioEditorValidationContext["boundedNumber"];
  const context = { add, boundedString, boundedNumber };

  if (!isStudioEditorRecord(value)) {
    return [
      {
        path: "$",
        code: "invalid_project",
        message: "Expected a project object.",
      },
    ];
  }
  addStudioEditorUnexpectedKeyIssues(
    value,
    "$",
    ["version", "id", "productId", "name", "canvas", "scenes", "activeSceneId"],
    add,
  );
  if (value.version !== STUDIO_EDITOR_PROJECT_VERSION) {
    add(
      "version",
      "unsupported_version",
      "Expected Studio editor project version 1.",
    );
  }
  boundedString(value.id, "id", 120);
  boundedString(value.productId, "productId", 120);
  boundedString(value.name, "name", 200);

  let fps = 0;
  if (!isStudioEditorRecord(value.canvas)) {
    add("canvas", "invalid_canvas", "Expected a canvas object.");
  } else {
    addStudioEditorUnexpectedKeyIssues(
      value.canvas,
      "canvas",
      ["width", "height", "fps", "backgroundColor"],
      add,
    );
    if (
      boundedNumber(value.canvas.width, "canvas.width", 16, 8192) &&
      !Number.isInteger(value.canvas.width)
    ) {
      add(
        "canvas.width",
        "invalid_integer",
        "Canvas width must be a whole number.",
      );
    }
    if (
      boundedNumber(value.canvas.height, "canvas.height", 16, 8192) &&
      !Number.isInteger(value.canvas.height)
    ) {
      add(
        "canvas.height",
        "invalid_integer",
        "Canvas height must be a whole number.",
      );
    }
    if (
      boundedNumber(value.canvas.fps, "canvas.fps", 1, 120) &&
      Number.isInteger(value.canvas.fps)
    ) {
      fps = value.canvas.fps;
    } else if (finite(value.canvas.fps)) {
      add("canvas.fps", "invalid_fps", "FPS must be a whole number.");
    }
    boundedString(value.canvas.backgroundColor, "canvas.backgroundColor", 64);
  }

  if (
    !Array.isArray(value.scenes) ||
    value.scenes.length < 1 ||
    value.scenes.length > 50
  ) {
    add("scenes", "invalid_scenes", "Expected between 1 and 50 scenes.");
    return issues;
  }

  const sceneIds = new Set<string>();
  const trackIds = new Set<string>();
  const layerIds = new Set<string>();
  let mainSceneCount = 0;
  for (const [sceneIndex, sceneValue] of value.scenes.entries()) {
    const scenePath = `scenes[${sceneIndex}]`;
    if (!isStudioEditorRecord(sceneValue)) {
      add(scenePath, "invalid_scene", "Expected a scene object.");
      continue;
    }
    addStudioEditorUnexpectedKeyIssues(
      sceneValue,
      scenePath,
      ["id", "name", "isMain", "tracks"],
      add,
    );
    if (boundedString(sceneValue.id, `${scenePath}.id`, 120)) {
      if (sceneIds.has(sceneValue.id)) {
        add(
          `${scenePath}.id`,
          "duplicate_scene_id",
          "Scene IDs must be unique.",
        );
      }
      sceneIds.add(sceneValue.id);
    }
    boundedString(sceneValue.name, `${scenePath}.name`, 200);
    if (typeof sceneValue.isMain !== "boolean") {
      add(`${scenePath}.isMain`, "invalid_boolean", "Expected a boolean.");
    } else if (sceneValue.isMain) {
      mainSceneCount += 1;
    }
    if (
      !Array.isArray(sceneValue.tracks) ||
      sceneValue.tracks.length < 1 ||
      sceneValue.tracks.length > 50
    ) {
      add(
        `${scenePath}.tracks`,
        "invalid_tracks",
        "Expected between 1 and 50 tracks.",
      );
      continue;
    }
    for (const [trackIndex, trackValue] of sceneValue.tracks.entries()) {
      const trackPath = `${scenePath}.tracks[${trackIndex}]`;
      if (!isStudioEditorRecord(trackValue)) {
        add(trackPath, "invalid_track", "Expected a track object.");
        continue;
      }
      addStudioEditorUnexpectedKeyIssues(
        trackValue,
        trackPath,
        ["id", "name", "kind", "hidden", "muted", "locked", "layers"],
        add,
      );
      if (boundedString(trackValue.id, `${trackPath}.id`, 120)) {
        if (trackIds.has(trackValue.id)) {
          add(
            `${trackPath}.id`,
            "duplicate_track_id",
            "Track IDs must be unique.",
          );
        }
        trackIds.add(trackValue.id);
      }
      boundedString(trackValue.name, `${trackPath}.name`, 200);
      if (
        typeof trackValue.kind !== "string" ||
        !trackKinds.has(trackValue.kind)
      ) {
        add(
          `${trackPath}.kind`,
          "invalid_track_kind",
          "Expected visual, audio, or caption.",
        );
      }
      for (const field of ["hidden", "muted", "locked"] as const) {
        if (typeof trackValue[field] !== "boolean") {
          add(
            `${trackPath}.${field}`,
            "invalid_boolean",
            "Expected a boolean.",
          );
        }
      }
      if (!Array.isArray(trackValue.layers) || trackValue.layers.length > 500) {
        add(
          `${trackPath}.layers`,
          "invalid_layers",
          "Expected no more than 500 layers.",
        );
        continue;
      }
      for (const [layerIndex, layerValue] of trackValue.layers.entries()) {
        const path = `${trackPath}.layers[${layerIndex}]`;
        if (!isStudioEditorRecord(layerValue)) {
          add(path, "invalid_layer", "Expected a layer object.");
          continue;
        }
        if (boundedString(layerValue.id, `${path}.id`, 120)) {
          if (layerIds.has(layerValue.id)) {
            add(
              `${path}.id`,
              "duplicate_layer_id",
              "Layer IDs must be unique.",
            );
          }
          layerIds.add(layerValue.id);
        }
        boundedString(layerValue.name, `${path}.name`, 200);
        if (
          typeof layerValue.kind !== "string" ||
          !layerKinds.has(layerValue.kind)
        ) {
          add(
            `${path}.kind`,
            "invalid_layer_kind",
            "Layer kind is not supported.",
          );
          continue;
        }
        const layerKeys = [
          "id",
          "kind",
          "name",
          "startSeconds",
          "durationSeconds",
          "sourceOffsetSeconds",
          ...(layerValue.kind === "video"
            ? [
                "source",
                "sourceDurationSeconds",
                "playbackSpeed",
                "transform",
                "crop",
                "audio",
                "transitionIn",
              ]
            : layerValue.kind === "image"
              ? ["source", "transform", "crop", "transitionIn"]
              : layerValue.kind === "text"
                ? ["text", "style", "transform", "transitionIn"]
                : layerValue.kind === "voice" || layerValue.kind === "music"
                  ? [
                      "source",
                      "sourceDurationSeconds",
                      "playbackSpeed",
                      "audio",
                    ]
                  : ["cues", "style"]),
        ];
        addStudioEditorUnexpectedKeyIssues(layerValue, path, layerKeys, add);
        if (
          typeof trackValue.kind === "string" &&
          trackKinds.has(trackValue.kind) &&
          !isStudioEditorLayerCompatibleWithTrack(
            layerValue.kind as never,
            trackValue.kind as never,
          )
        ) {
          add(
            path,
            "incompatible_track",
            "Layer kind is not compatible with this track.",
          );
        }
        const startValid = boundedNumber(
          layerValue.startSeconds,
          `${path}.startSeconds`,
          0,
          86_400,
        );
        const durationValid = boundedNumber(
          layerValue.durationSeconds,
          `${path}.durationSeconds`,
          fps > 0 ? 1 / fps : 0.001,
          86_400,
        );
        const offsetValid = boundedNumber(
          layerValue.sourceOffsetSeconds,
          `${path}.sourceOffsetSeconds`,
          0,
          86_400,
        );
        for (const [field, valid] of [
          ["startSeconds", startValid],
          ["durationSeconds", durationValid],
        ] as const) {
          if (
            valid &&
            fps > 0 &&
            !isStudioEditorFrameAligned(layerValue[field] as number, fps)
          ) {
            add(
              `${path}.${field}`,
              "not_frame_aligned",
              "Timeline values must align to a project frame.",
            );
          }
        }
        if (
          offsetValid &&
          fps > 0 &&
          (layerValue.kind === "text" || layerValue.kind === "caption") &&
          !isStudioEditorFrameAligned(
            layerValue.sourceOffsetSeconds as number,
            fps,
          )
        ) {
          add(
            `${path}.sourceOffsetSeconds`,
            "not_frame_aligned",
            "Text and caption source offsets must align to a project frame.",
          );
        }

        const hasSource = ["video", "image", "voice", "music"].includes(
          layerValue.kind,
        );
        if (hasSource) {
          if (!isStudioEditorRecord(layerValue.source)) {
            add(
              `${path}.source`,
              "invalid_source",
              "Expected a durable source reference.",
            );
          } else {
            const source = layerValue.source;
            addStudioEditorUnexpectedKeyIssues(
              source,
              `${path}.source`,
              source.kind === "videoClip"
                ? ["kind", "videoClipId"]
                : source.kind === "stitch"
                  ? ["kind", "stitchId"]
                  : source.kind === "studioOutput"
                    ? ["kind", "outputId"]
                    : source.kind === "studioUpload"
                      ? ["kind", "objectKey"]
                      : ["kind"],
              add,
            );
            const sourceField =
              source.kind === "videoClip"
                ? "videoClipId"
                : source.kind === "stitch"
                  ? "stitchId"
                  : source.kind === "studioOutput"
                    ? "outputId"
                    : source.kind === "studioUpload"
                      ? "objectKey"
                      : undefined;
            if (
              !sourceField ||
              !isStudioEditorDurableRef(source[sourceField])
            ) {
              add(
                `${path}.source`,
                "invalid_source",
                "Source must use a supported durable ID or object key, never a URL.",
              );
            }
          }
        }

        if (["video", "voice", "music"].includes(layerValue.kind)) {
          const sourceDurationValid = boundedNumber(
            layerValue.sourceDurationSeconds,
            `${path}.sourceDurationSeconds`,
            fps > 0 ? 1 / fps : 0.001,
            86_400,
          );
          const speedValid = boundedNumber(
            layerValue.playbackSpeed,
            `${path}.playbackSpeed`,
            0.25,
            4,
          );
          if (
            sourceDurationValid &&
            speedValid &&
            durationValid &&
            offsetValid &&
            (layerValue.sourceOffsetSeconds as number) +
              (layerValue.durationSeconds as number) *
                (layerValue.playbackSpeed as number) >
              (layerValue.sourceDurationSeconds as number) + 1e-7
          ) {
            add(
              path,
              "source_overrun",
              "Layer trim consumes more than the available source duration.",
            );
          }
          validateStudioEditorAudioSettings(
            layerValue.audio,
            path,
            layerValue.durationSeconds,
            context,
          );
        }
        if (
          layerValue.kind === "image" &&
          layerValue.sourceOffsetSeconds !== 0
        ) {
          add(
            `${path}.sourceOffsetSeconds`,
            "invalid_image_offset",
            "Image layers must use a zero source offset.",
          );
        }
        if (["video", "image", "text"].includes(layerValue.kind)) {
          validateStudioEditorTransform(layerValue.transform, path, context);
          if (layerValue.kind !== "text") {
            validateStudioEditorCrop(layerValue.crop, path, context);
          }
          validateStudioEditorTransition(
            layerValue.transitionIn,
            path,
            layerValue.durationSeconds,
            context,
          );
        }
        if (layerValue.kind === "text") {
          boundedString(layerValue.text, `${path}.text`, 20_000);
          validateStudioEditorTextStyle(
            layerValue.style,
            `${path}.style`,
            context,
          );
        }
        if (layerValue.kind === "caption") {
          validateStudioEditorCaptionLayer(layerValue, path, fps, context);
        }
      }
    }
  }
  if (mainSceneCount !== 1) {
    add(
      "scenes",
      "invalid_main_scene",
      "Exactly one scene must be marked as main.",
    );
  }
  if (
    typeof value.activeSceneId !== "string" ||
    !sceneIds.has(value.activeSceneId)
  ) {
    add(
      "activeSceneId",
      "missing_active_scene",
      "Active scene must reference a scene in the project.",
    );
  }

  return issues;
}
