import type { CliprContentType } from "@/lib/clipstitchr/types/CliprContentType";
import { getCliprContentTypeLabel } from "@/lib/clipstitchr/utils/getCliprContentTypeLabel";

type CreateCliprGeneratedVideoPromptOptions = {
  audienceDetails: string;
  contentType: CliprContentType;
  filledHook: string;
  productDetails: string;
  productName: string;
  scenePrompt: string;
};

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
    `Scene direction: ${scenePrompt}`,
    "Use realistic camera movement, natural light, and commercially usable footage.",
    "Do not render captions, subtitles, floating words, logos, watermarks, or UI text inside the video.",
    "Keep the composition clean enough for ClipStitchr to place editable text overlays later.",
  ].join("\n");
}
