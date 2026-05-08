import { createUserR2KeyPrefix } from "@/lib/clipstitchr/server/r2/createUserR2KeyPrefix";

export function assertR2ObjectKeyBelongsToUser(key: string, userId: string) {
  const userPrefix = createUserR2KeyPrefix(userId);

  if (!key.startsWith(userPrefix)) {
    throw new Error("R2 object key is outside the authenticated user scope.");
  }
}
