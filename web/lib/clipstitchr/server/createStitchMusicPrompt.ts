import type { TextOverlay } from "@/lib/clipstitchr/types/TextOverlay";

type CreateStitchMusicPromptOptions = {
  demoClipName: string;
  textOverlay?: TextOverlay;
  ugcClipName: string;
};

export function createStitchMusicPrompt({
  demoClipName,
  textOverlay,
  ugcClipName,
}: CreateStitchMusicPromptOptions) {
  const context = [ugcClipName, demoClipName]
    .map((value) => value.trim())
    .filter(Boolean)
    .join(" into ")
    .slice(0, 420);
  const overlayText = textOverlay?.text.replace(/\s+/g, " ").trim().slice(0, 220);

  return [
    "Instrumental-only background music for a short-form social video ad.",
    "No vocals, no speech, no lyrics, no voice samples.",
    "Modern warm pop-electronic bed, light percussion, clean bass, subtle synth texture, confident and useful mood.",
    "Mixed to sit underneath original ad audio without competing with dialogue or product narration.",
    "Well-arranged composition, 110 BPM.",
    context ? `Video sequence context: ${context}.` : "",
    overlayText ? `On-screen hook mood reference: ${overlayText}.` : "",
  ]
    .filter(Boolean)
    .join(" ");
}
