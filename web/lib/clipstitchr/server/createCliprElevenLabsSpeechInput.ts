import { getCliprVoice } from "@/lib/clipstitchr/utils/getCliprVoice";

type CreateCliprElevenLabsSpeechInputOptions = {
  script: string;
  voiceId: string;
};

export function createCliprElevenLabsSpeechInput({
  script,
  voiceId,
}: CreateCliprElevenLabsSpeechInputOptions) {
  const voice = getCliprVoice(voiceId);

  return {
    prompt: script,
    voice: voice.id,
    language_code: "en",
    speed: 1,
    stability: 0.5,
    similarity_boost: 0.8,
    style: 0.2,
  };
}
