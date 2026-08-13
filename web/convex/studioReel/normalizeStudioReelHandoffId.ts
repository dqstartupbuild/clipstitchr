import { assertStudioReelBoundedString } from "./assertStudioReelBoundedString";

export function normalizeStudioReelHandoffId(
  value: string | null,
  label: string,
): string | null {
  return value === null
    ? null
    : assertStudioReelBoundedString(value, { label, maxLength: 240 });
}
