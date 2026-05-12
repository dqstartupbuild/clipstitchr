const POSTER_IMAGE_QUALITY = 0.86;
const POSTER_IMAGE_TYPE = "image/jpeg";
const POSTER_ENCODE_TIMEOUT_MS = 7000;

export async function encodeCanvasAsPosterBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      reject(new Error("Timed out encoding poster image."));
    }, POSTER_ENCODE_TIMEOUT_MS);

    canvas.toBlob(
      (posterBlob) => {
        window.clearTimeout(timeoutId);

        if (posterBlob) {
          resolve(posterBlob);
          return;
        }

        reject(new Error("Unable to encode poster image."));
      },
      POSTER_IMAGE_TYPE,
      POSTER_IMAGE_QUALITY,
    );
  });
}
