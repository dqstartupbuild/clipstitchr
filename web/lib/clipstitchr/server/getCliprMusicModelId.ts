export function getCliprMusicModelId() {
  return (
    process.env.CLIPR_MUSIC_MODEL_ID ?? "stability-ai/stable-audio-2.5"
  );
}
