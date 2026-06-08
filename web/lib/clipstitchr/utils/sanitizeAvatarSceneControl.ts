import { avatarSceneControlMaxLength } from "@/lib/clipstitchr/constants/avatarSceneControlMaxLength";

export function sanitizeAvatarSceneControl(value: unknown) {
  return typeof value === "string"
    ? value.trim().slice(0, avatarSceneControlMaxLength)
    : "";
}
