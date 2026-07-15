import { createEmailConfirmationResponseHeaders } from "@/lib/clipstitchr/email/confirmation/createEmailConfirmationResponseHeaders";

export function createEmailConfirmationHtmlResponse(
  html: string,
  {
    retryAfter,
    setCookies,
    status = 200,
  }: {
    retryAfter?: string;
    setCookies?: readonly string[];
    status?: number;
  } = {},
) {
  const headers = createEmailConfirmationResponseHeaders();

  if (retryAfter) {
    headers.set("Retry-After", retryAfter);
  }

  for (const cookie of setCookies ?? []) {
    headers.append("Set-Cookie", cookie);
  }

  return new Response(html, { headers, status });
}
