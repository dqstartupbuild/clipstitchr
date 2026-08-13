import type { PublishingMediaSourceKind } from "@/lib/clipstitchr/publishing/media/PublishingMediaSourceKind";

export type PublishingMediaSourceDescriptor = {
  kind: PublishingMediaSourceKind;
  recordId: string;
};
