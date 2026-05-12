const VIDEO_READY_STATE_HAVE_CURRENT_DATA = 2;
const VIDEO_SEEK_TIME_EPSILON = 0.001;
const VIDEO_SEEK_TIMEOUT_MS = 7000;

export async function seekVideoToTime(
  video: HTMLVideoElement,
  time: number,
): Promise<void> {
  if (
    Math.abs(video.currentTime - time) < VIDEO_SEEK_TIME_EPSILON &&
    video.readyState >= VIDEO_READY_STATE_HAVE_CURRENT_DATA
  ) {
    return;
  }

  await new Promise<void>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      cleanup();
      reject(new Error("Timed out seeking video for poster capture."));
    }, VIDEO_SEEK_TIMEOUT_MS);
    const cleanup = () => {
      window.clearTimeout(timeoutId);
      video.removeEventListener("loadeddata", handleReady);
      video.removeEventListener("seeked", handleReady);
      video.removeEventListener("error", handleError);
    };
    const handleReady = () => {
      cleanup();
      resolve();
    };
    const handleError = () => {
      cleanup();
      reject(new Error("Unable to seek video for poster capture."));
    };

    video.addEventListener("loadeddata", handleReady, { once: true });
    video.addEventListener("seeked", handleReady, { once: true });
    video.addEventListener("error", handleError, { once: true });

    if (Math.abs(video.currentTime - time) < VIDEO_SEEK_TIME_EPSILON) {
      if (video.readyState >= VIDEO_READY_STATE_HAVE_CURRENT_DATA) {
        cleanup();
        resolve();
      }

      return;
    }

    video.currentTime = time;
  });
}
