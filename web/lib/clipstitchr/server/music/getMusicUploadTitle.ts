import { getMusicUploadTitle as getFallbackMusicUploadTitle } from "@/lib/clipstitchr/utils/getMusicUploadTitle";

export function getMusicUploadTitle(
  value: FormDataEntryValue | null,
  fileName: string,
) {
  const title =
    typeof value === "string" && value.trim()
      ? value.trim()
      : getFallbackMusicUploadTitle(fileName);

  return title.replace(/\s+/g, " ").slice(0, 120);
}
