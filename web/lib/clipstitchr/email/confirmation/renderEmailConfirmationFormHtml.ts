import type { EmailConfirmationUrlFields } from "@/lib/clipstitchr/email/confirmation/EmailConfirmationUrlFields";
import { createEmailConfirmationHtmlDocument } from "@/lib/clipstitchr/email/confirmation/createEmailConfirmationHtmlDocument";
import { escapeEmailConfirmationHtml } from "@/lib/clipstitchr/email/confirmation/escapeEmailConfirmationHtml";

export function renderEmailConfirmationFormHtml({
  csrfToken,
  fields,
}: {
  csrfToken: string;
  fields: EmailConfirmationUrlFields;
}) {
  const bodyHtml = `<h1>Confirm your email</h1>
<p>Press the button only if you asked to join the ClipStitchr app-marketing mailing list. This confirms marketing email consent. It does not create a product account.</p>
<form action="/email/confirm" method="post">
  <input name="id" type="hidden" value="${escapeEmailConfirmationHtml(fields.tokenRecordId)}">
  <input name="expires" type="hidden" value="${escapeEmailConfirmationHtml(fields.expires)}">
  <input name="signature" type="hidden" value="${escapeEmailConfirmationHtml(fields.signature)}">
  <input name="csrf" type="hidden" value="${escapeEmailConfirmationHtml(csrfToken)}">
  <button type="submit">Confirm my email</button>
</form>`;

  return createEmailConfirmationHtmlDocument({
    bodyHtml,
    title: "Confirm your email",
  });
}
