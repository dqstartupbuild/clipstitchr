import type { CliprContentType } from "@/lib/clipstitchr/types/CliprContentType";
import { getCliprContentTypeLabel } from "@/lib/clipstitchr/utils/getCliprContentTypeLabel";
import { getCliprContentTypeUsesVoiceover } from "@/lib/clipstitchr/utils/getCliprContentTypeUsesVoiceover";

type CreateCliprGeneratedVideoPromptOptions = {
  audienceDetails: string;
  contentType: CliprContentType;
  filledHook: string;
  productDetails: string;
  productName: string;
  scenePrompt: string;
};

function getGeneratedVideoSpeechRules(contentType: CliprContentType) {
  if (contentType === "b-roll-reel") {
    return [
      "This must be silent b-roll only: no voiceover, no narration, no dialogue, no talking-head delivery, no lip-sync, and no person visibly speaking.",
      "Show ambient action, gestures, lifestyle movement, product-adjacent activity, or niche-relevant cutaway footage instead of a speaking performance.",
    ];
  }

  if (getCliprContentTypeUsesVoiceover(contentType)) {
    return [
      "This visual scene will sit under separate avatar-voice narration.",
      "Do not show anyone speaking, lip-syncing, addressing camera, holding a microphone, or performing dialogue.",
    ];
  }

  return [
    "This scene must not include spoken performance: no voiceover, no narration, no dialogue, no talking-head delivery, no lip-sync, and no person visibly speaking.",
  ];
}

export function createCliprGeneratedVideoPrompt({
  audienceDetails,
  contentType,
  filledHook,
  productDetails,
  productName,
  scenePrompt,
}: CreateCliprGeneratedVideoPromptOptions) {
  return [
    `Create one vertical 9:16 short-form ${getCliprContentTypeLabel(contentType)} scene.`,
    `Hook context: ${filledHook}`,
    `Audience context: ${audienceDetails}`,
    `Product context: ${productName} - ${productDetails}`,
    `Scene direction, excluding any request for visible text, UI, logos, narration, dialogue, or speaking: ${scenePrompt}`,
    "If the scene direction conflicts with the constraints below, ignore the conflicting part and follow the constraints.",
    "Use realistic camera movement, natural light, and commercially usable footage.",
    "Keep a clean real-world camera frame with no graphic overlay elements.",
    "Never render captions, subtitles, lower thirds, floating words, typography, letters, numbers, speech bubbles, signs, labels, posters, packaging text, logos, watermarks, brand marks, app screens, phone screens, dashboards, UI, website pages, social-media interfaces, or any other visible text inside the video.",
    "Keep the composition clean enough for ClipStitchr to place editable text overlays later.",
    ...getGeneratedVideoSpeechRules(contentType),
  ].join("\n");
}
