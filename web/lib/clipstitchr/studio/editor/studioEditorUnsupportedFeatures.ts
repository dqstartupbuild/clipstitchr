import type { StudioEditorUnsupportedFeature } from "../../types/studioEditor/StudioEditorUnsupportedFeature";

export const studioEditorUnsupportedFeatures: readonly StudioEditorUnsupportedFeature[] =
  [
    {
      key: "animated_parameters",
      upstreamCapability: "Parameter keyframes and easing curves",
      limitation:
        "Version 1 stores one static value for each editable property.",
    },
    {
      key: "masks",
      upstreamCapability: "Shape and custom point masks",
      limitation: "Version 1 supports rectangular crop only.",
    },
    {
      key: "effect_stack",
      upstreamCapability: "Arbitrary reorderable visual and audio effects",
      limitation:
        "Version 1 supports only declared transform, crop, audio, and transition fields.",
    },
    {
      key: "source_audio_separation",
      upstreamCapability: "Detached source audio tracks",
      limitation: "Version 1 controls embedded video audio on the video layer.",
    },
    {
      key: "ripple_editing",
      upstreamCapability: "Automatic downstream ripple moves",
      limitation:
        "Version 1 commands edit only the addressed layer and track order.",
    },
    {
      key: "nested_scene_compositing",
      upstreamCapability: "Scene elements nested inside other scenes",
      limitation: "Version 1 scenes are independent timelines.",
    },
  ] as const;
