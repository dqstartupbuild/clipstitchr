import type { Doc } from "@/convex/_generated/dataModel";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";
import type { SharedMusicTrack } from "@/lib/clipstitchr/types/SharedMusicTrack";

export type CliprJobInputDocuments = {
  avatar: Doc<"avatars"> | null;
  avatarPhoto: Doc<"photoAssets"> | null;
  demoClip: Doc<"videoClips"> | null;
  product: ProductProfile;
  selectedMusicTrack: SharedMusicTrack | null;
};
