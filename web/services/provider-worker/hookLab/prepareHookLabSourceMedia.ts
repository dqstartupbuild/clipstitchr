import { fetchHookLabRemoteImage } from "@/lib/clipstitchr/server/hookLab/fetchHookLabRemoteImage";
import { fetchHookLabRemoteVideo } from "@/lib/clipstitchr/server/hookLab/fetchHookLabRemoteVideo";
import { deleteHookLabTemporaryVideo } from "@/lib/clipstitchr/server/hookLab/deleteHookLabTemporaryVideo";
import type { HookLabImportedPost } from "@/lib/clipstitchr/types/HookLabImportedPost";
import { createHookLabSlideshowVideo } from "./createHookLabSlideshowVideo";
import { writeHookLabTemporaryImage } from "./writeHookLabTemporaryImage";
import { writeHookLabTemporaryVideo } from "./writeHookLabTemporaryVideo";

export async function prepareHookLabSourceMedia(
  source: HookLabImportedPost,
  maxBytes: number,
) {
  if (source.temporaryVideoUrl) {
    const fetchedVideo = await fetchHookLabRemoteVideo({
      maxBytes,
      timeoutMs: 60_000,
      url: source.temporaryVideoUrl,
    });

    return {
      body: fetchedVideo.bytes,
      contentType: fetchedVideo.contentType,
      durationSeconds: undefined,
      filePath: await writeHookLabTemporaryVideo(fetchedVideo.bytes),
    };
  }

  const imageUrls = source.temporaryImageUrls?.slice(0, 20) ?? [];

  if (!imageUrls.length) {
    throw new Error(`${source.platform} does not expose usable post media.`);
  }

  const maxImageBytes = Math.min(
    10 * 1024 * 1024,
    Math.floor(maxBytes / imageUrls.length),
  );
  const images = await Promise.all(
    imageUrls.map((url) =>
      fetchHookLabRemoteImage({ maxBytes: maxImageBytes, timeoutMs: 60_000, url }),
    ),
  );
  const imagePaths: string[] = [];

  try {
    for (const image of images) {
      imagePaths.push(
        await writeHookLabTemporaryImage(image.bytes, image.contentType),
      );
    }

    return await createHookLabSlideshowVideo(imagePaths);
  } finally {
    await Promise.allSettled(
      imagePaths.map((filePath) =>
        deleteHookLabTemporaryVideo({ filePath }),
      ),
    );
  }
}
