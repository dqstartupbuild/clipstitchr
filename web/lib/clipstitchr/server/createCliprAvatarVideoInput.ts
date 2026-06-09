import { createCliprAvatarVideoPrompt } from "@/lib/clipstitchr/server/createCliprAvatarVideoPrompt";
import { getCliprVoice } from "@/lib/clipstitchr/utils/getCliprVoice";

type CreateCliprAvatarVideoInputOptions = {
  audioUrl?: string;
  imageUrl: string;
  script: string;
  voiceId: string;
};

export function createCliprAvatarVideoInput({
  audioUrl,
  imageUrl,
  script,
  voiceId,
}: CreateCliprAvatarVideoInputOptions) {
  const baseInput = {
    ...(audioUrl ? { audio: audioUrl } : {}),
    image: imageUrl,
    video_prompt: createCliprAvatarVideoPrompt(),
    resolution: "720p",
    disable_prompt_upsampling: true,
  };

  if (audioUrl) {
    return baseInput;
  }

  const voice = getCliprVoice(voiceId);

  return {
    ...baseInput,
    voice_script: script,
    voice: "Zephyr (Female)",
    voice_language: "English (US)",
    voice_prompt: voice.prompt,
  };
}
