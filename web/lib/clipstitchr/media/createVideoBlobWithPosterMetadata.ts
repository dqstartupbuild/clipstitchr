import { Conversion } from "mediabunny";
import { createMediaInput } from "@/lib/clipstitchr/media/createMediaInput";
import { createMp4Output } from "@/lib/clipstitchr/media/createMp4Output";
import { createVideoBlobFromBuffer } from "@/lib/clipstitchr/media/createVideoBlobFromBuffer";
import { createVideoPosterBlob } from "@/lib/clipstitchr/media/createVideoPosterBlob";
import { getVideoMimeType } from "@/lib/clipstitchr/media/getVideoMimeType";

type CreateVideoBlobWithPosterMetadataOptions = {
  posterBlob?: Blob;
  title?: string;
  videoBlob: Blob;
};

export async function createVideoBlobWithPosterMetadata({
  posterBlob,
  title,
  videoBlob,
}: CreateVideoBlobWithPosterMetadataOptions) {
  const coverBlob = posterBlob ?? (await createFallbackPosterBlob(videoBlob));

  if (!coverBlob) {
    return videoBlob;
  }

  const input = createMediaInput(videoBlob);

  try {
    const output = createMp4Output();
    const posterBytes = new Uint8Array(await coverBlob.arrayBuffer());
    const conversion = await Conversion.init({
      input,
      output,
      tags: (inputTags) => ({
        ...inputTags,
        title: title?.trim() || inputTags.title,
        images: [
          {
            data: posterBytes,
            description: title?.trim() || "Video poster",
            kind: "coverFront",
            mimeType: coverBlob.type || "image/jpeg",
            name: "poster.jpg",
          },
        ],
      }),
      showWarnings: false,
    });

    if (!conversion.isValid) {
      return videoBlob;
    }

    await conversion.execute();

    const mimeType = await getVideoMimeType(output);

    return createVideoBlobFromBuffer(output.target.buffer, mimeType);
  } finally {
    input.dispose();
  }
}

async function createFallbackPosterBlob(videoBlob: Blob) {
  try {
    return await createVideoPosterBlob(videoBlob);
  } catch {
    return null;
  }
}
