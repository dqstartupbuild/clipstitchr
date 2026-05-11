type CreateCliprSeedancePromptOptions = {
  avatarPrompt: string;
  script: string;
};

export function createCliprSeedancePrompt({
  avatarPrompt,
  script,
}: CreateCliprSeedancePromptOptions) {
  return [
    "Create a vertical short-form social video.",
    "Use [Image1] only as an authorized creator reference for general appearance, styling, and continuity.",
    "Do not use [Image1] as the first frame. Do not recreate the uploaded photo, pose, crop, background, or still-image composition.",
    "Create an original scene with the creator in a new natural location that fits the scene direction.",
    `Scene direction: ${avatarPrompt}`,
    "Use [Audio1] only as the spoken voice and timing reference for the creator's dialogue.",
    `Spoken dialogue: "${script}"`,
    "Generate synchronized audio with clear speech, subtle room tone, and one relevant natural sound effect when it supports the scene.",
    "Keep the scene brand-safe and everyday. Avoid medical, political, sexual, violent, shocking, age-sensitive, or protected-identity content.",
    "Keep the camera vertical, realistic, and social-native. Avoid captions, subtitles, logos, watermarks, and on-screen text.",
  ].join("\n");
}
