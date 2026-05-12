import type { CliprScenePlan } from "@/lib/clipstitchr/types/CliprScenePlan";

type CreateCliprSceneAvatarImagePromptOptions = {
  avatarDescription?: string;
  scene: CliprScenePlan;
};

export function createCliprSceneAvatarImagePrompt({
  avatarDescription,
  scene,
}: CreateCliprSceneAvatarImagePromptOptions) {
  return [
    "Create one realistic vertical UGC-style source photo for a short-form video scene.",
    "Use the reference image to preserve the same person's facial identity and stable non-sensitive traits.",
    avatarDescription ? `Avatar description: ${avatarDescription}` : "",
    `Scene context: ${scene.scriptText}`,
    `Photo direction: ${scene.visualPrompt}`,
    "Make the photo look creator-shot, casual, believable, and ready for image-to-video animation.",
    "Frame the person naturally in a phone-friendly vertical portrait composition with room for subtle motion.",
    "Use a real-world setting that matches the scene context. Keep the expression and pose natural.",
    "Do not include text, captions, logos, app screens, readable UI, watermarks, borders, or graphic design.",
    "Do not make a collage, grid, contact sheet, poster, illustration, painting, or studio render.",
    "Output one complete photo only.",
  ]
    .filter(Boolean)
    .join("\n");
}
