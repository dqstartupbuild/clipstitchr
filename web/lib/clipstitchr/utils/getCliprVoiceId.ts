import {
  CLIPR_DEFAULT_VOICE_ID,
  CLIPR_VOICE_OPTIONS,
} from "@/lib/clipstitchr/constants/cliprVoiceOptions";

export function getCliprVoiceId(value: string) {
  return CLIPR_VOICE_OPTIONS.some((voice) => voice.id === value)
    ? value
    : CLIPR_DEFAULT_VOICE_ID;
}
