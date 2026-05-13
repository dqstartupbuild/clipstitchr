import type { R2ObjectReference } from "@/lib/clipstitchr/types/R2ObjectReference";

type GetDeletableMusicAudioObjectOptions = {
  audioObject: R2ObjectReference;
};

export function getDeletableMusicAudioObject({
  audioObject,
}: GetDeletableMusicAudioObjectOptions) {
  return audioObject.key.startsWith("users/") ? audioObject : undefined;
}
