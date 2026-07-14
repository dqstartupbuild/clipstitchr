import { EmailConfirmationRequestError } from "@/lib/clipstitchr/email/confirmation/EmailConfirmationRequestError";
import { confirmEmailConsentWithConvex } from "@/lib/clipstitchr/email/confirmation/confirmEmailConsentWithConvex";
import { createEmailConfirmationClientKey } from "@/lib/clipstitchr/email/confirmation/createEmailConfirmationClientKey";
import { createEmailConfirmationHtmlResponse } from "@/lib/clipstitchr/email/confirmation/createEmailConfirmationHtmlResponse";
import { createEmailConfirmationRateLimitResponse } from "@/lib/clipstitchr/email/confirmation/createEmailConfirmationRateLimitResponse";
import { createEmailConfirmationVerificationUrl } from "@/lib/clipstitchr/email/confirmation/createEmailConfirmationVerificationUrl";
import { createExpiredEmailConfirmationCsrfCookie } from "@/lib/clipstitchr/email/confirmation/createExpiredEmailConfirmationCsrfCookie";
import { getEmailConfirmationCsrfIsValid } from "@/lib/clipstitchr/email/confirmation/getEmailConfirmationCsrfIsValid";
import { getEmailConfirmationRequestIsSameOrigin } from "@/lib/clipstitchr/email/confirmation/getEmailConfirmationRequestIsSameOrigin";
import { logEmailConfirmationDevelopmentStage } from "@/lib/clipstitchr/email/confirmation/logEmailConfirmationDevelopmentStage";
import { readEmailConfirmationCsrfCookie } from "@/lib/clipstitchr/email/confirmation/readEmailConfirmationCsrfCookie";
import { readEmailConfirmationPostFields } from "@/lib/clipstitchr/email/confirmation/readEmailConfirmationPostFields";
import { renderEmailConfirmationStatusHtml } from "@/lib/clipstitchr/email/confirmation/renderEmailConfirmationStatusHtml";
import { verifyEmailConfirmationUrl } from "@/lib/clipstitchr/email/confirmation/verifyEmailConfirmationUrl";
import { getRateLimitApiSecret } from "@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret";

export async function handleEmailConfirmationPost(request: Request) {
  if (!getEmailConfirmationRequestIsSameOrigin(request)) {
    logEmailConfirmationDevelopmentStage("origin-rejected");
    return createEmailConfirmationHtmlResponse(
      renderEmailConfirmationStatusHtml("unavailable"),
      { status: 403 },
    );
  }

  try {
    const fields = await readEmailConfirmationPostFields(request);
    const cookieToken = readEmailConfirmationCsrfCookie(
      request.headers.get("cookie"),
    );

    if (!getEmailConfirmationCsrfIsValid(cookieToken, fields.csrfToken)) {
      logEmailConfirmationDevelopmentStage("csrf-rejected");
      return createEmailConfirmationHtmlResponse(
        renderEmailConfirmationStatusHtml("unavailable"),
        { status: 403 },
      );
    }

    const reference = await verifyEmailConfirmationUrl(
      createEmailConfirmationVerificationUrl(request.url, fields),
    );

    if (
      !reference ||
      reference.tokenRecordId !== fields.tokenRecordId ||
      reference.expiresAt !== Number(fields.expires)
    ) {
      logEmailConfirmationDevelopmentStage("reference-rejected");
      return createEmailConfirmationHtmlResponse(
        renderEmailConfirmationStatusHtml("unavailable"),
      );
    }

    const secret = getRateLimitApiSecret();
    const confirmation = await confirmEmailConsentWithConvex({
      clientKey: createEmailConfirmationClientKey(request, secret),
      confirmedAt: Date.now(),
      reference,
    });
    const setCookie = createExpiredEmailConfirmationCsrfCookie(request.url);

    if (confirmation.status !== "confirmed") {
      logEmailConfirmationDevelopmentStage("provider-unavailable");
      return createEmailConfirmationHtmlResponse(
        renderEmailConfirmationStatusHtml("unavailable"),
        { setCookie },
      );
    }

    logEmailConfirmationDevelopmentStage("confirmed");
    return createEmailConfirmationHtmlResponse(
      renderEmailConfirmationStatusHtml("confirmed"),
      { setCookie },
    );
  } catch (error) {
    const rateLimitResponse = createEmailConfirmationRateLimitResponse(error);

    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    if (error instanceof EmailConfirmationRequestError) {
      logEmailConfirmationDevelopmentStage("request-rejected");
      return createEmailConfirmationHtmlResponse(
        renderEmailConfirmationStatusHtml("unavailable"),
        { status: error.status },
      );
    }

    logEmailConfirmationDevelopmentStage("server-error");
    return createEmailConfirmationHtmlResponse(
      renderEmailConfirmationStatusHtml("error"),
      { status: 500 },
    );
  }
}
