import { libraryTabChangeEventName } from "@/lib/clipstitchr/constants/libraryTabChangeEventName";
import type { LibraryTab } from "@/lib/clipstitchr/types/LibraryTab";

export function dispatchLibraryTabChangeEvent(tab: LibraryTab) {
  if (
    typeof window === "undefined" ||
    typeof window.dispatchEvent !== "function" ||
    typeof CustomEvent !== "function"
  ) {
    return;
  }

  window.dispatchEvent(
    new CustomEvent(libraryTabChangeEventName, {
      detail: { tab },
    }),
  );
}
