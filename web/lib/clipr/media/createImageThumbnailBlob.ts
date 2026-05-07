const MAX_THUMBNAIL_EDGE = 640;

export async function createImageThumbnailBlob(blob: Blob): Promise<Blob> {
  const imageUrl = URL.createObjectURL(blob);
  const image = new Image();

  try {
    const loaded = new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("Unable to load image thumbnail."));
    });

    image.src = imageUrl;
    await loaded;

    const scale = Math.min(
      1,
      MAX_THUMBNAIL_EDGE / Math.max(image.naturalWidth, image.naturalHeight),
    );
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));

    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("Unable to create thumbnail canvas.");
    }

    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (thumbnailBlob) => {
          if (thumbnailBlob) {
            resolve(thumbnailBlob);
            return;
          }

          reject(new Error("Unable to encode image thumbnail."));
        },
        "image/jpeg",
        0.82,
      );
    });
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
}
