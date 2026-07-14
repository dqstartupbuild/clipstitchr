import { timingSafeEqual } from "node:crypto";

export function getEmailConfirmationCsrfIsValid(
  cookieToken: string | null,
  formToken: string,
) {
  if (
    !cookieToken ||
    !/^[A-Za-z0-9_-]{43}$/.test(cookieToken) ||
    !/^[A-Za-z0-9_-]{43}$/.test(formToken)
  ) {
    return false;
  }

  return timingSafeEqual(Buffer.from(cookieToken), Buffer.from(formToken));
}
