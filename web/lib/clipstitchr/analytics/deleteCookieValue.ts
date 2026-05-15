import { setCookieValue } from "@/lib/clipstitchr/analytics/setCookieValue";

export function deleteCookieValue(name: string) {
  setCookieValue(name, "", 0);
}
