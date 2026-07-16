import type { ClerkAccountContactInput } from "./ClerkAccountContactInput";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type ClerkPrimaryEmailSource = Readonly<{
  email_addresses?: ReadonlyArray<{
    email_address?: unknown;
    id?: unknown;
    verification?: { status?: unknown } | null;
  }>;
  primary_email_address_id?: string | null;
}>;

export function getVerifiedPrimaryClerkEmail(
  user: ClerkPrimaryEmailSource,
): Pick<
  ClerkAccountContactInput,
  "normalizedEmail" | "primaryEmailId"
> | null {
  const primaryEmailId = user.primary_email_address_id?.trim();

  if (
    !primaryEmailId ||
    primaryEmailId.length > 256 ||
    !Array.isArray(user.email_addresses)
  ) {
    return null;
  }

  const primaryEmail = user.email_addresses.find(
    (candidate) => candidate?.id === primaryEmailId,
  );
  const normalizedEmail =
    typeof primaryEmail?.email_address === "string"
      ? primaryEmail.email_address.trim().toLowerCase()
      : "";

  if (
    primaryEmail?.verification?.status !== "verified" ||
    !normalizedEmail ||
    normalizedEmail.length > 320 ||
    !emailPattern.test(normalizedEmail)
  ) {
    return null;
  }

  return { normalizedEmail, primaryEmailId };
}
