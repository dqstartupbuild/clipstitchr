import type { UserJSON } from "@clerk/backend";
import type { ClerkAccountContactInput } from "./ClerkAccountContactInput";
import { normalizeClerkAccountName } from "./normalizeClerkAccountName";

export function getClerkAccountNames(
  user: Pick<UserJSON, "first_name" | "last_name" | "username">,
): Pick<ClerkAccountContactInput, "displayName" | "firstName"> {
  const firstName = normalizeClerkAccountName(user.first_name);
  const lastName = normalizeClerkAccountName(user.last_name);
  const fullName = [firstName, lastName].filter(Boolean).join(" ");
  const displayName = fullName || normalizeClerkAccountName(user.username);

  return { displayName, firstName };
}
