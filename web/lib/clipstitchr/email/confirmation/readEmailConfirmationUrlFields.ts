import type { EmailConfirmationUrlFields } from "@/lib/clipstitchr/email/confirmation/EmailConfirmationUrlFields";

export function readEmailConfirmationUrlFields(
  requestUrl: string | URL,
): EmailConfirmationUrlFields | null {
  let url: URL;

  try {
    url = typeof requestUrl === "string" ? new URL(requestUrl) : requestUrl;
  } catch {
    return null;
  }

  const keys = Array.from(url.searchParams.keys());
  const tokenRecordIds = url.searchParams.getAll("id");
  const expirations = url.searchParams.getAll("expires");
  const signatures = url.searchParams.getAll("signature");

  if (
    keys.length !== 3 ||
    !keys.every((key) =>
      key === "id" || key === "expires" || key === "signature"
    ) ||
    tokenRecordIds.length !== 1 ||
    expirations.length !== 1 ||
    signatures.length !== 1
  ) {
    return null;
  }

  const [tokenRecordId] = tokenRecordIds;
  const [expires] = expirations;
  const [signature] = signatures;

  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      tokenRecordId,
    ) ||
    !/^\d{1,16}$/.test(expires) ||
    !/^[A-Za-z0-9_-]{43}$/.test(signature)
  ) {
    return null;
  }

  return { expires, signature, tokenRecordId };
}
