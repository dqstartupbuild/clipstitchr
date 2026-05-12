import { cliprVoices } from "@/lib/clipstitchr/constants/cliprVoices";
import { defaultCliprVoiceId } from "@/lib/clipstitchr/constants/defaultCliprVoiceId";

export function getCliprVoice(voiceId: string) {
  return (
    cliprVoices.find((voice) => voice.id === voiceId) ??
    cliprVoices.find((voice) => voice.id === defaultCliprVoiceId) ??
    cliprVoices[0]
  );
}
