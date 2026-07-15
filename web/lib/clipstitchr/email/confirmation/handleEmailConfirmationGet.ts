import { createEmailConfirmationCsrfCookie } from "@/lib/clipstitchr/email/confirmation/createEmailConfirmationCsrfCookie";
import { createEmailConfirmationCsrfToken } from "@/lib/clipstitchr/email/confirmation/createEmailConfirmationCsrfToken";
import { createEmailConfirmationHtmlResponse } from "@/lib/clipstitchr/email/confirmation/createEmailConfirmationHtmlResponse";
import { inspectEmailConfirmationWithConvex } from "@/lib/clipstitchr/email/confirmation/inspectEmailConfirmationWithConvex";
import { readEmailConfirmationUrlFields } from "@/lib/clipstitchr/email/confirmation/readEmailConfirmationUrlFields";
import { renderEmailConfirmationFormHtml } from "@/lib/clipstitchr/email/confirmation/renderEmailConfirmationFormHtml";
import { renderEmailConfirmationStatusHtml } from "@/lib/clipstitchr/email/confirmation/renderEmailConfirmationStatusHtml";
import { verifyEmailConfirmationUrl } from "@/lib/clipstitchr/email/confirmation/verifyEmailConfirmationUrl";

export async function handleEmailConfirmationGet(request: Request) {
  try {
    const fields = readEmailConfirmationUrlFields(request.url);
    const reference = fields
      ? await verifyEmailConfirmationUrl(request.url)
      : null;

    if (
      !fields ||
      !reference ||
      reference.tokenRecordId !== fields.tokenRecordId ||
      reference.expiresAt !== Number(fields.expires)
    ) {
      return createEmailConfirmationHtmlResponse(
        renderEmailConfirmationStatusHtml("unavailable"),
      );
    }

    const inspection = await inspectEmailConfirmationWithConvex(
      reference,
      Date.now(),
    );

    if (inspection.status !== "ready") {
      return createEmailConfirmationHtmlResponse(
        renderEmailConfirmationStatusHtml("unavailable"),
      );
    }

    const csrfToken = createEmailConfirmationCsrfToken();

    return createEmailConfirmationHtmlResponse(
      renderEmailConfirmationFormHtml({ csrfToken, fields }),
      {
        setCookies: [
          createEmailConfirmationCsrfCookie(csrfToken, request.url),
        ],
      },
    );
  } catch {
    return createEmailConfirmationHtmlResponse(
      renderEmailConfirmationStatusHtml("error"),
      { status: 500 },
    );
  }
}
