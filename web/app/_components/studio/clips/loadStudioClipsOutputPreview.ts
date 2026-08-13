import type { Dispatch, SetStateAction } from "react";

export async function loadStudioClipsOutputPreview(
  getDownloadUrl: () => Promise<{ url: string } | null>,
  setPreviewUrl: Dispatch<SetStateAction<string | null>>,
) {
  const signed = await getDownloadUrl();
  if (signed) {
    setPreviewUrl(signed.url);
  }
}
