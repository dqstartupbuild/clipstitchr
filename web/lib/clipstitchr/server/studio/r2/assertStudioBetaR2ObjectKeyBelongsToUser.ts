import { createUserR2KeyPrefix } from "@/lib/clipstitchr/server/r2/createUserR2KeyPrefix";

export function assertStudioBetaR2ObjectKeyBelongsToUser(
  key: string,
  userId: string,
) {
  const studioPrefix = `${createUserR2KeyPrefix(userId)}studio/v1/`;

  if (
    key.length <= studioPrefix.length ||
    key.length > 1_024 ||
    !key.startsWith(studioPrefix) ||
    key.includes("..") ||
    key.includes("\\") ||
    key.includes("?") ||
    key.includes("#") ||
    /[\u0000-\u001f\u007f]/.test(key)
  ) {
    throw new Error("That Studio file is outside this account.");
  }
}
