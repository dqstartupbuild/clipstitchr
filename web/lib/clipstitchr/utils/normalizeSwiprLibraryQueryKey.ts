import { normalizeSwiprLibraryQueryName } from "./normalizeSwiprLibraryQueryName";

export function normalizeSwiprLibraryQueryKey(value?: string) {
  return normalizeSwiprLibraryQueryName(value ?? "").toLocaleLowerCase();
}
