import { createEmailConfirmationResponseHeaders } from "@/lib/clipstitchr/email/confirmation/createEmailConfirmationResponseHeaders";

export function createEmailConfirmationHtmlResponse(
  html: string,
  {
    retryAfter,
    setCookie,
    status = 200,
  }: {
    retryAfter?: string;
    setCookie?: string;
    status?: number;
  } = {},
) {
  const headers = createEmailConfirmationResponseHeaders();

  if (retryAfter) {
    headers.set("Retry-After", retryAfter);
  }

  if (setCookie) {
    headers.set("Set-Cookie", setCookie);
  }

  return new Response(html, { headers, status });
}
