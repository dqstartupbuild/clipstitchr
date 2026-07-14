import { emailConfirmationCsrfCookieName } from "@/lib/clipstitchr/email/confirmation/emailConfirmationCsrfCookieName";

export function createExpiredEmailConfirmationCsrfCookie(
  requestUrl: string | URL,
) {
  const url =
    typeof requestUrl === "string" ? new URL(requestUrl) : requestUrl;
  const secure = url.protocol === "https:" ? "; Secure" : "";

  return `${emailConfirmationCsrfCookieName}=; Max-Age=0; Path=/email/confirm; HttpOnly; SameSite=Strict${secure}`;
}
