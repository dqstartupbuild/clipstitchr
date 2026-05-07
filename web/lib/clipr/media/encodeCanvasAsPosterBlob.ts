const POSTER_IMAGE_QUALITY = 0.86;
const POSTER_IMAGE_TYPE = "image/jpeg";

export async function encodeCanvasAsPosterBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (posterBlob) => {
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
