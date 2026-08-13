import { createId } from "@/lib/clipstitchr/utils/createId";

export function createStudioClipsIdempotencyKey(operation: string) {
  return `${operation}-${createId()}`;
}
