export function readOptionalLazyReelFormValue(
  data: FormData,
  name: string,
): string | undefined {
  return String(data.get(name) ?? "").trim() || undefined;
}
