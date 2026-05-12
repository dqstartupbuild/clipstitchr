import type { Doc } from "@/convex/_generated/dataModel";
import type { Avatar } from "@/lib/clipstitchr/types/Avatar";

export function createAvatarFromConvexDocument(
  avatar: Doc<"avatars">,
): Avatar {
  return {
    id: avatar.id,
    name: avatar.name,
    description: avatar.description,
    wardrobeStyle: avatar.wardrobeStyle ?? "any",
    createdAt: avatar.createdAt,
    updatedAt: avatar.updatedAt,
  };
}
