import { getHookLabParsedString } from "./getHookLabParsedString";

export function getHookLabOptionalParsedString(
  value: unknown,
  maxLength = 500,
) {
  const text = getHookLabParsedString(value, "", maxLength);

  return text || undefined;
}
