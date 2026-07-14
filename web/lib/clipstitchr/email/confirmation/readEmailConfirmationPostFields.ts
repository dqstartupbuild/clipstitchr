import { EmailConfirmationRequestError } from "@/lib/clipstitchr/email/confirmation/EmailConfirmationRequestError";
import type { EmailConfirmationPostFields } from "@/lib/clipstitchr/email/confirmation/EmailConfirmationPostFields";
import { readEmailConfirmationBodyText } from "@/lib/clipstitchr/email/confirmation/readEmailConfirmationBodyText";
import { readEmailConfirmationUrlFields } from "@/lib/clipstitchr/email/confirmation/readEmailConfirmationUrlFields";

export async function readEmailConfirmationPostFields(
  request: Request,
): Promise<EmailConfirmationPostFields> {
  const contentType = request.headers.get("content-type")?.toLowerCase() ?? "";

  if (
    contentType.split(";", 1)[0]?.trim() !==
    "application/x-www-form-urlencoded"
  ) {
    throw new EmailConfirmationRequestError(415);
  }

  const params = new URLSearchParams(await readEmailConfirmationBodyText(request));
  const keys = Array.from(params.keys());
  const csrfTokens = params.getAll("csrf");
  const [csrfToken] = csrfTokens;

  if (
    keys.length !== 4 ||
    !keys.every((key) =>
      key === "csrf" ||
      key === "id" ||
      key === "expires" ||
      key === "signature"
    ) ||
    csrfTokens.length !== 1 ||
    !csrfToken ||
    !/^[A-Za-z0-9_-]{43}$/.test(csrfToken)
  ) {
    throw new EmailConfirmationRequestError(400);
  }

  const confirmationUrl = new URL("https://confirmation.invalid");

  for (const key of ["id", "expires", "signature"] as const) {
    for (const value of params.getAll(key)) {
      confirmationUrl.searchParams.append(key, value);
    }
  }

  const fields = readEmailConfirmationUrlFields(confirmationUrl);

  if (!fields) {
    throw new EmailConfirmationRequestError(400);
  }

  return {
    ...fields,
    csrfToken,
  };
}
