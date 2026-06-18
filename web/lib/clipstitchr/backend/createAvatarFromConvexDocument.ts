import type { Doc } from "@/convex/_generated/dataModel";
import type { Avatar } from "@/lib/clipstitchr/types/Avatar";
import { getCliprVoiceId } from "@/lib/clipstitchr/utils/getCliprVoiceId";

export function createAvatarFromConvexDocument(
  avatar: Doc<"avatars">,
): Avatar {
  return {
    id: avatar.id,
    productId: avatar.productId,
    name: avatar.name,
    description: avatar.description,
    wardrobeStyle: avatar.wardrobeStyle ?? "any",
    cliprVoiceId: getCliprVoiceId(avatar.cliprVoiceId),
    createdAt: avatar.createdAt,
    updatedAt: avatar.updatedAt,
  };
}
