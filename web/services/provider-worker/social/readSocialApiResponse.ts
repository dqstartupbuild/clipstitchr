import { SocialApiError } from "./SocialApiError";
import { redactSocialDiagnosticString } from "@/lib/clipstitchr/server/social/redactSocialDiagnosticString";
import { getSocialRetryAfterMs } from "./getSocialRetryAfterMs";

export async function readSocialApiResponse<T>(
  response: Response,
  fallbackMessage: string,
) {
  const body = await response.text();

  if (!response.ok) {
    let message = fallbackMessage;

    try {
      const parsed = JSON.parse(body) as {
        error?: { message?: string };
        error_description?: string;
        message?: string;
      };
      message =
        parsed.error?.message ??
        parsed.error_description ??
        parsed.message ??
        fallbackMessage;
    } catch {
      // Keep the user-safe fallback. Raw provider bodies stay in attempt history.
    }

    throw new SocialApiError(
      redactSocialDiagnosticString(message),
      response.status,
      redactSocialDiagnosticString(body),
      getSocialRetryAfterMs(response.headers.get("Retry-After")),
    );
  }

  try {
    return JSON.parse(body) as T;
  } catch {
    throw new SocialApiError(
      fallbackMessage,
      response.status,
      redactSocialDiagnosticString(body),
    );
  }
}
