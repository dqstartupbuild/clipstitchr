import { emailConfirmationCsrfCookieName } from "@/lib/clipstitchr/email/confirmation/emailConfirmationCsrfCookieName";
import { emailConfirmationCsrfLifetimeSeconds } from "@/lib/clipstitchr/email/confirmation/emailConfirmationCsrfLifetimeSeconds";

export function createEmailConfirmationCsrfCookie(
  csrfToken: string,
  requestUrl: string | URL,
) {
  const url =
    typeof requestUrl === "string" ? new URL(requestUrl) : requestUrl;
  const secure = url.protocol === "https:" ? "; Secure" : "";

  return `${emailConfirmationCsrfCookieName}=${csrfToken}; Max-Age=${emailConfirmationCsrfLifetimeSeconds}; Path=/email/confirm; HttpOnly; SameSite=Strict${secure}`;
}
