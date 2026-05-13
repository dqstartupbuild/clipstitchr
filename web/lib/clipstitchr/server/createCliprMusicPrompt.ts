type CreateCliprMusicPromptOptions = {
  audienceDetails: string;
  productName: string;
  script: string;
};

export function createCliprMusicPrompt({
  audienceDetails,
  productName,
  script,
}: CreateCliprMusicPromptOptions) {
  const context = [productName, audienceDetails]
    .map((value) => value.trim())
    .filter(Boolean)
    .join(". ")
    .slice(0, 420);
  const narration = script.replace(/\s+/g, " ").trim().slice(0, 520);

  return [
    "Instrumental-only background music for a short-form social video ad.",
    "No vocals, no speech, no lyrics, no voice samples.",
    "Modern warm pop-electronic bed, light percussion, clean bass, subtle synth texture, confident and useful mood.",
    "Mixed to sit underneath spoken narration without competing with the voice.",
    "Well-arranged composition, 110 BPM.",
    context ? `Audience and product context: ${context}.` : "",
    narration ? `Narration mood reference: ${narration}` : "",
  ]
    .filter(Boolean)
    .join(" ");
}
