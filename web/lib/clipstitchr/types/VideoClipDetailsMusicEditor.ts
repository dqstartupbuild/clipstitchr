import type { CliprMusicMetadata } from "@/lib/clipstitchr/types/CliprMusicMetadata";

export type VideoClipDetailsMusicEditor = {
  error: string | null;
  isGenerating: boolean;
  isSaving: boolean;
  onGenerate: () => Promise<CliprMusicMetadata | null>;
  onRemove: () => Promise<void>;
  onSave: (music: CliprMusicMetadata) => Promise<void>;
};
