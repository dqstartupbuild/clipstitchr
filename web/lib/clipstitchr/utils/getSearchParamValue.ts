export function getSearchParamValue(name: string) {
  if (typeof window === "undefined") {
    return undefined;
  }

  return new URL(window.location.href).searchParams.get(name) ?? undefined;
}
