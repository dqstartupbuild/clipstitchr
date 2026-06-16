import { ACCEPTED_MUSIC_TYPES } from "@/lib/clipstitchr/constants/acceptedMusicTypes";
import { MAX_MUSIC_UPLOAD_SIZE_BYTES } from "@/lib/clipstitchr/constants/maxMusicUploadSizeBytes";
import { formatBytes } from "@/lib/clipstitchr/utils/formatBytes";

export function getMusicUploadFile(value: FormDataEntryValue | null) {
  if (!(value instanceof File)) {
    throw new Error("Choose a music file.");
  }

  if (!(ACCEPTED_MUSIC_TYPES as readonly string[]).includes(value.type)) {
    throw new Error("Choose an MP3, M4A, WAV, OGG, FLAC, AAC, or WebM file.");
  }

  if (value.size <= 0) {
    throw new Error("Choose a non-empty music file.");
  }

  if (value.size > MAX_MUSIC_UPLOAD_SIZE_BYTES) {
    throw new Error(
      `Music uploads must be ${formatBytes(MAX_MUSIC_UPLOAD_SIZE_BYTES)} or smaller.`,
    );
  }

  return value;
}
