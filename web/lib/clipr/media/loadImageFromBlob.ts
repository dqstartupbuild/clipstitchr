export async function loadImageFromBlob(blob: Blob) {
  const imageUrl = URL.createObjectURL(blob);
  const image = new Image();

  try {
    const loaded = new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("Unable to load this image."));
    });

    image.src = imageUrl;
    await loaded;

    return image;
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
}
