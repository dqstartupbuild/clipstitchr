import type { CliprJobCreateInput } from "@/lib/clipstitchr/server/clipr/CliprJobCreateInput";
import { getCliprContentTypeNeedsAvatar } from "@/lib/clipstitchr/utils/getCliprContentTypeNeedsAvatar";

export function assertCliprJobCreateInput(input: CliprJobCreateInput) {
  if (!input.productId) {
    throw new Error("Choose a saved product first.");
  }

  if (getCliprContentTypeNeedsAvatar(input.contentType) && !input.avatarId) {
    throw new Error("Choose an avatar first.");
  }
}
