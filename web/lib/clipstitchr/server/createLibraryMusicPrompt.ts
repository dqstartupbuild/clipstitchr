type CreateLibraryMusicPromptOptions = {
  style?: string;
};

export function createLibraryMusicPrompt({
  style,
}: CreateLibraryMusicPromptOptions) {
  const styleText = style?.replace(/\s+/g, " ").trim().slice(0, 220);

  return [
    "Instrumental-only background music for short-form marketing videos.",
    "No vocals, no speech, no lyrics, no voice samples.",
    styleText
      ? `Style and mood: ${styleText}.`
      : "Modern warm pop-electronic bed, light percussion, clean bass, subtle synth texture, confident and useful mood.",
    "Mixed to sit underneath dialogue, product narration, and original camera audio.",
    "Well-arranged composition, 110 BPM.",
  ].join(" ");
}
