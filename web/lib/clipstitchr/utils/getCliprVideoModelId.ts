import type { CliprVideoModelId } from "@/lib/clipstitchr/types/CliprVideoModelId";

export function getCliprVideoModelId(value: unknown): CliprVideoModelId {
  return value === "prunaai/p-video-avatar" ||
    value === "kwaivgi/kling-v3-video" ||
    value === "bytedance/seedance-2.0" ||
    value === "google/veo-3.1" ||
    value === "openai/sora-2" ||
    value === "openai/sora-2-pro" ||
    value === "auto"
    ? value
    : "auto";
}
