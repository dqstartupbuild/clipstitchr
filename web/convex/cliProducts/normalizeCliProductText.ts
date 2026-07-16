export function normalizeCliProductText(value: string, maxLength: number) {
  return value.trim().slice(0, maxLength);
}
