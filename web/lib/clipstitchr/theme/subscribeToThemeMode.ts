import { themeModeChangeEventName } from "@/lib/clipstitchr/theme/themeModeChangeEventName";

export function subscribeToThemeMode(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(themeModeChangeEventName, onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(themeModeChangeEventName, onStoreChange);
  };
}
