import type { AvatarIdentityMode } from "@/lib/clipstitchr/types/AvatarIdentityMode";

export function getAvatarIdentityMode(value: string): AvatarIdentityMode {
  return value === "similar" ? "similar" : "same";
}
