import { emailConfirmationContentSecurityPolicy } from "@/lib/clipstitchr/email/confirmation/emailConfirmationContentSecurityPolicy";

export function createEmailConfirmationResponseHeaders() {
  return new Headers({
    "Cache-Control": "private, no-store, max-age=0",
    "Content-Security-Policy": emailConfirmationContentSecurityPolicy,
    "Content-Type": "text/html; charset=utf-8",
    "Referrer-Policy": "no-referrer",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-Robots-Tag": "noindex, nofollow, noarchive",
  });
}
