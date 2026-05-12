import { createVideoPosterCandidateTimes } from "@/lib/clipstitchr/media/createVideoPosterCandidateTimes";
import { encodeCanvasAsPosterBlob } from "@/lib/clipstitchr/media/encodeCanvasAsPosterBlob";
import { getCanvasVisiblePixelRatio } from "@/lib/clipstitchr/media/getCanvasVisiblePixelRatio";
import { seekVideoToTime } from "@/lib/clipstitchr/media/seekVideoToTime";

const MIN_VISIBLE_PIXEL_RATIO = 0.03;
const VIDEO_METADATA_TIMEOUT_MS = 7000;

export async function createVideoPosterBlob(videoBlob: Blob): Promise<Blob> {
  const videoUrl = URL.createObjectURL(videoBlob);
  const video = document.createElement("video");

  try {
    video.muted = true;
    video.playsInline = true;
    video.preload = "metadata";

    const metadataLoaded = new Promise<void>((resolve, reject) => {
      const timeoutId = window.setTimeout(() => {
        cleanup();
        reject(new Error("Timed out loading video metadata for poster capture."));
      }, VIDEO_METADATA_TIMEOUT_MS);
      const cleanup = () => {
        window.clearTimeout(timeoutId);
        video.onloadedmetadata = null;
        video.onerror = null;
      };

      video.onloadedmetadata = () => {
        cleanup();
        resolve();
      };
      video.onerror = () => {
        cleanup();
        reject(new Error("Unable to load video metadata for poster capture."));
      };
    });

    video.src = videoUrl;
    await metadataLoaded;

    if (video.videoWidth === 0 || video.videoHeight === 0) {
      throw new Error("Unable to read video dimensions for poster capture.");
    }

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("Unable to create canvas context for poster capture.");
    }

    let bestTime = 0;
    let bestVisiblePixelRatio = 0;

    for (const candidateTime of createVideoPosterCandidateTimes(video.duration)) {
      await seekVideoToTime(video, candidateTime);
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const visiblePixelRatio = getCanvasVisiblePixelRatio(
        context,
        canvas.width,
        canvas.height,
      );

      if (visiblePixelRatio > bestVisiblePixelRatio) {
        bestTime = candidateTime;
        bestVisiblePixelRatio = visiblePixelRatio;
      }

      if (visiblePixelRatio >= MIN_VISIBLE_PIXEL_RATIO) {
        return encodeCanvasAsPosterBlob(canvas);
      }
    }

    await seekVideoToTime(video, bestTime);
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    return encodeCanvasAsPosterBlob(canvas);
  } finally {
    video.removeAttribute("src");
    video.load();
    URL.revokeObjectURL(videoUrl);
  }
}
