import { visitStudioStitchJsonValue } from "./visitStudioStitchJsonValue";

export function isStudioStitchJsonSafe(value: unknown): boolean {
  return visitStudioStitchJsonValue(new Set<object>(), value);
}
