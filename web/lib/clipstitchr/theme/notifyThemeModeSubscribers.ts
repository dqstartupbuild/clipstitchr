import { themeModeChangeEventName } from "@/lib/clipstitchr/theme/themeModeChangeEventName";

export function notifyThemeModeSubscribers() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event(themeModeChangeEventName));
}
