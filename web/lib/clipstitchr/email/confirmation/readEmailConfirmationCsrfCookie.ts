import { emailConfirmationCsrfCookieName } from "@/lib/clipstitchr/email/confirmation/emailConfirmationCsrfCookieName";

export function readEmailConfirmationCsrfCookie(cookieHeader: string | null) {
  if (!cookieHeader) {
    return null;
  }

  for (const cookie of cookieHeader.split(";")) {
    const separatorIndex = cookie.indexOf("=");

    if (separatorIndex < 0) {
      continue;
    }

    const name = cookie.slice(0, separatorIndex).trim();

    if (name !== emailConfirmationCsrfCookieName) {
      continue;
    }

    const value = cookie.slice(separatorIndex + 1).trim();

    return /^[A-Za-z0-9_-]{43}$/.test(value) ? value : null;
  }

  return null;
}
