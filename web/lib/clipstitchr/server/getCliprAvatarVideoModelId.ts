import type { CliprVideoModelId } from "@/lib/clipstitchr/types/CliprVideoModelId";

export function getCliprAvatarVideoModelId(): Exclude<
  CliprVideoModelId,
  "auto"
> {
  return "prunaai/p-video-avatar";
}
