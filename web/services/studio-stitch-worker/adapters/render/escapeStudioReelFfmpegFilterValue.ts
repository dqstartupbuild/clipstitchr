export function escapeStudioReelFfmpegFilterValue(value: string) {
  return value.replace(/([\\:'\[\],;])/g, "\\$1");
}
