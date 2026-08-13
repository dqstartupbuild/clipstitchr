import type { StudioEditorCaptionLayer } from "../../../types/studioEditor/StudioEditorCaptionLayer";
import type { StudioEditorImageLayer } from "../../../types/studioEditor/StudioEditorImageLayer";
import type { StudioEditorMusicLayer } from "../../../types/studioEditor/StudioEditorMusicLayer";
import type { StudioEditorTextLayer } from "../../../types/studioEditor/StudioEditorTextLayer";
import type { StudioEditorVideoLayer } from "../../../types/studioEditor/StudioEditorVideoLayer";
import type { StudioEditorVoiceLayer } from "../../../types/studioEditor/StudioEditorVoiceLayer";
import { createDefaultStudioEditorAudioSettings } from "../createDefaultStudioEditorAudioSettings";
import { createDefaultStudioEditorCaptionStyle } from "../createDefaultStudioEditorCaptionStyle";
import { createDefaultStudioEditorCrop } from "../createDefaultStudioEditorCrop";
import { createDefaultStudioEditorTextStyle } from "../createDefaultStudioEditorTextStyle";
import { createDefaultStudioEditorTransform } from "../createDefaultStudioEditorTransform";
import { createDefaultStudioEditorTransition } from "../createDefaultStudioEditorTransition";
import { createStudioEditorProjectV1 } from "../createStudioEditorProjectV1";

export function createStudioEditorTestFixture() {
  const project = createStudioEditorProjectV1({
    id: "editor_project_1",
    productId: "product_1",
    name: "Launch cut",
    sceneId: "scene_1",
    visualTrackId: "visual_1",
    audioTrackId: "audio_1",
    captionTrackId: "caption_1",
  });
  const video: StudioEditorVideoLayer = {
    id: "video_1",
    kind: "video",
    name: "Opening clip",
    startSeconds: 0,
    durationSeconds: 4,
    sourceOffsetSeconds: 1,
    sourceDurationSeconds: 20,
    source: { kind: "videoClip", videoClipId: "clip_1" },
    playbackSpeed: 1,
    transform: createDefaultStudioEditorTransform(),
    crop: createDefaultStudioEditorCrop(),
    audio: {
      ...createDefaultStudioEditorAudioSettings(),
      fadeInSeconds: 0.5,
      fadeOutSeconds: 0.5,
    },
    transitionIn: createDefaultStudioEditorTransition(),
  };
  const image: StudioEditorImageLayer = {
    id: "image_1",
    kind: "image",
    name: "Product still",
    startSeconds: 4,
    durationSeconds: 2,
    sourceOffsetSeconds: 0,
    source: { kind: "studioUpload", objectKey: "studio/uploads/product.png" },
    transform: createDefaultStudioEditorTransform(),
    crop: createDefaultStudioEditorCrop(),
    transitionIn: { kind: "crossfade", durationSeconds: 0.5 },
  };
  const text: StudioEditorTextLayer = {
    id: "text_1",
    kind: "text",
    name: "Headline",
    startSeconds: 0,
    durationSeconds: 2,
    sourceOffsetSeconds: 0,
    text: "Stop scrolling",
    style: createDefaultStudioEditorTextStyle(),
    transform: createDefaultStudioEditorTransform(),
    transitionIn: createDefaultStudioEditorTransition(),
  };
  const voice: StudioEditorVoiceLayer = {
    id: "voice_1",
    kind: "voice",
    name: "Voiceover",
    startSeconds: 0,
    durationSeconds: 6,
    sourceOffsetSeconds: 0,
    sourceDurationSeconds: 6,
    source: { kind: "studioOutput", outputId: "voice_output_1" },
    playbackSpeed: 1,
    audio: createDefaultStudioEditorAudioSettings(),
  };
  const music: StudioEditorMusicLayer = {
    id: "music_1",
    kind: "music",
    name: "Bed",
    startSeconds: 0,
    durationSeconds: 6,
    sourceOffsetSeconds: 1,
    sourceDurationSeconds: 20,
    source: { kind: "studioUpload", objectKey: "studio/uploads/music.mp3" },
    playbackSpeed: 1,
    audio: { ...createDefaultStudioEditorAudioSettings(), volume: 0.3 },
  };
  const caption: StudioEditorCaptionLayer = {
    id: "caption_layer_1",
    kind: "caption",
    name: "English captions",
    startSeconds: 0,
    durationSeconds: 6,
    sourceOffsetSeconds: 0,
    cues: [
      { id: "cue_1", startSeconds: 0, endSeconds: 2, text: "Stop scrolling" },
      { id: "cue_2", startSeconds: 2, endSeconds: 4, text: "Look at this" },
    ],
    style: createDefaultStudioEditorCaptionStyle(),
  };
  return { project, video, image, text, voice, music, caption };
}
