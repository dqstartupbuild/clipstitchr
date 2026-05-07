export type ImageDimensions = {
  width: number;
  height: number;
};

export async function getImageDimensions(blob: Blob): Promise<ImageDimensions> {
  const imageUrl = URL.createObjectURL(blob);
  const image = new Image();

  try {
    const loaded = new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("Unable to read this image file."));
    });

    image.src = imageUrl;
    await loaded;

    return {
      width: image.naturalWidth,
      height: image.naturalHeight,
    };
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
}
