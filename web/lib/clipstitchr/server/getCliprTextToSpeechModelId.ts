const DEFAULT_CLIPR_TTS_MODEL_ID = "elevenlabs/v3";

export function getCliprTextToSpeechModelId() {
  return process.env.CLIPR_TTS_MODEL_ID ?? DEFAULT_CLIPR_TTS_MODEL_ID;
}
