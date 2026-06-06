import { seekVideoToTime } from "@/lib/clipstitchr/media/seekVideoToTime";

const VIDEO_METADATA_TIMEOUT_MS = 7000;

type DrawVideoFrameToCanvasOptions = {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  time: number;
  videoBlob: Blob;
};

export async function drawVideoFrameToCanvas({
  canvas,
  context,
  time,
  videoBlob,
}: DrawVideoFrameToCanvasOptions) {
  const videoUrl = URL.createObjectURL(videoBlob);
  const video = document.createElement("video");

  try {
    video.muted = true;
    video.playsInline = true;
    video.preload = "metadata";

    const metadataLoaded = new Promise<void>((resolve, reject) => {
      const timeoutId = window.setTimeout(() => {
        cleanup();
        reject(new Error("Timed out loading video metadata for canvas draw."));
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
        reject(new Error("Unable to load video metadata for canvas draw."));
      };
    });

    video.src = videoUrl;
    await metadataLoaded;

    if (video.videoWidth === 0 || video.videoHeight === 0) {
      throw new Error("Unable to read video dimensions for canvas draw.");
    }

    await seekVideoToTime(video, time);

    const scale = Math.max(
      canvas.width / video.videoWidth,
      canvas.height / video.videoHeight,
    );
    const width = video.videoWidth * scale;
    const height = video.videoHeight * scale;
    const x = (canvas.width - width) / 2;
    const y = (canvas.height - height) / 2;

    context.drawImage(video, x, y, width, height);
  } finally {
    video.removeAttribute("src");
    video.load();
    URL.revokeObjectURL(videoUrl);
  }
}
