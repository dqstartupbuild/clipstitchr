import { cliprVoices } from "@/lib/clipstitchr/constants/cliprVoices";
import { defaultCliprVoiceId } from "@/lib/clipstitchr/constants/defaultCliprVoiceId";

export function getCliprVoiceId(value: unknown) {
  if (typeof value !== "string") {
    return defaultCliprVoiceId;
  }

  return cliprVoices.some((voice) => voice.id === value)
    ? value
    : defaultCliprVoiceId;
}
