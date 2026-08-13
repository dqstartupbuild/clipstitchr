import { redactStudioClipsSensitiveNode } from "./redactStudioClipsSensitiveNode";

export function redactStudioClipsSensitiveValue(value: unknown): unknown {
  return redactStudioClipsSensitiveNode(value, 0, new WeakSet<object>());
}
