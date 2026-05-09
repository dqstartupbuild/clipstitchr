import type { R2ObjectReference } from "@/lib/clipstitchr/types/R2ObjectReference";

type PutBlobToR2Options = {
  blob: Blob;
  contentType: string;
  key: string;
  size: number;
  url: string;
};

export async function putBlobToR2({
  blob,
  contentType,
  key,
  size,
  url,
}: PutBlobToR2Options): Promise<R2ObjectReference> {
  const uploadResponse = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": contentType,
    },
    body: blob,
  });

  if (!uploadResponse.ok) {
    throw new Error("Unable to upload media to R2.");
  }

  return {
    key,
    contentType,
    size,
  };
}
