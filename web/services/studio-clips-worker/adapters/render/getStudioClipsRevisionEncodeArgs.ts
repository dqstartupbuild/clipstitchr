export function getStudioClipsRevisionEncodeArgs(hasAudio: boolean): string[] {
  return [
    "-c:v",
    "libx264",
    "-preset",
    "medium",
    "-crf",
    "20",
    "-pix_fmt",
    "yuv420p",
    ...(hasAudio ? ["-c:a", "aac", "-b:a", "192k"] : ["-an"]),
    "-movflags",
    "+faststart",
  ];
}
