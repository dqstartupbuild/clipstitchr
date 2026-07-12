import type { HookLabIdeaDefaults } from "@/lib/clipstitchr/types/HookLabIdeaDefaults";

type HookLabIdeaDefaultsDocument = {
  avatars: { id: string; name: string }[];
  defaultAvatarId?: string;
  defaultDemoClipId?: string;
  demoClips: { id: string; name: string }[];
};

export function createHookLabIdeaDefaultsFromConvexDocument(
  document: HookLabIdeaDefaultsDocument,
): HookLabIdeaDefaults {
  return {
    avatars: document.avatars,
    defaultAvatarId: document.defaultAvatarId,
    defaultDemoClipId: document.defaultDemoClipId,
    demoClips: document.demoClips,
  };
}
