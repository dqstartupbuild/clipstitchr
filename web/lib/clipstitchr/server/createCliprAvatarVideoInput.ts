import { createCliprAvatarVideoPrompt } from "@/lib/clipstitchr/server/createCliprAvatarVideoPrompt";
import { getCliprVoice } from "@/lib/clipstitchr/utils/getCliprVoice";

type CreateCliprAvatarVideoInputOptions = {
  imageUrl: string;
  script: string;
  voiceId: string;
};

export function createCliprAvatarVideoInput({
  imageUrl,
  script,
  voiceId,
}: CreateCliprAvatarVideoInputOptions) {
  const voice = getCliprVoice(voiceId);

  return {
    image: imageUrl,
    voice_script: script,
    voice: voice.id,
    voice_language: voice.language,
    voice_prompt: voice.prompt,
    video_prompt: createCliprAvatarVideoPrompt(),
    resolution: "720p",
    disable_prompt_upsampling: true,
  };
}
