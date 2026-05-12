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
    "Use the person in [Image1] only as the character identity reference for facial features, hair, general styling, and presence.",
    "Do not use [Image1] as the first frame. Do not recreate the uploaded photo, pose, crop, background, or still-image composition.",
    "Place the same character into a new natural location that fits the scene direction.",
    `Scene direction: ${avatarPrompt}`,
    "Use [Audio1] as the spoken voice and timing reference for lip sync.",
    `Spoken dialogue: "${script}"`,
    "Generate synchronized audio with clear speech, subtle room tone, and one relevant natural sound effect when it supports the scene.",
    "Keep the camera vertical, realistic, and social-native. Avoid captions, subtitles, logos, watermarks, and on-screen text.",
  ].join("\n");
}
