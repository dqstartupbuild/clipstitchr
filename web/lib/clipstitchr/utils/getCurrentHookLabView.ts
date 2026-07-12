import { getHookLabViewFromSearchParams } from "@/lib/clipstitchr/utils/getHookLabViewFromSearchParams";

export function getCurrentHookLabView() {
  if (typeof window === "undefined") {
    return "ideas" as const;
  }

  return getHookLabViewFromSearchParams(
    new URLSearchParams(window.location.search),
  );
}
