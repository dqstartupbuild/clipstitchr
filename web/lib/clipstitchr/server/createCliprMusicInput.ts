import { cliprMusicGenerationDefaults } from "@/lib/clipstitchr/constants/cliprMusicGenerationDefaults";

type CreateCliprMusicInputOptions = {
  prompt: string;
};

export function createCliprMusicInput({ prompt }: CreateCliprMusicInputOptions) {
  return {
    cfg_scale: cliprMusicGenerationDefaults.cfgScale,
    duration: cliprMusicGenerationDefaults.durationSeconds,
    prompt,
    steps: cliprMusicGenerationDefaults.steps,
  };
}
