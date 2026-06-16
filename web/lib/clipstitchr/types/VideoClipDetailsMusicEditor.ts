import type { CliprMusicMetadata } from "@/lib/clipstitchr/types/CliprMusicMetadata";

export type VideoClipDetailsMusicEditor = {
  error: string | null;
  isSaving: boolean;
  onRemove: () => Promise<void>;
  onSave: (music: CliprMusicMetadata) => Promise<void>;
};
