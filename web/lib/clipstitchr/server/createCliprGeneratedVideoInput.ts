type CreateCliprGeneratedVideoInputOptions = {
  durationSeconds: number;
  imageUrl?: string;
  prompt: string;
};

export function createCliprGeneratedVideoInput({
  durationSeconds,
  imageUrl,
  prompt,
}: CreateCliprGeneratedVideoInputOptions) {
  return {
    ...(imageUrl ? { image: imageUrl } : { aspect_ratio: "9:16" }),
    prompt,
    duration: Math.max(1, Math.min(20, Math.ceil(durationSeconds))),
    resolution: "720p",
    fps: 24,
    draft: false,
    prompt_upsampling: false,
    disable_safety_filter: true,
    save_audio: false,
  };
}
