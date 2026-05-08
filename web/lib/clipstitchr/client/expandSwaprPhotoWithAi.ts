export async function expandSwaprPhotoWithAi(imageBlob: Blob, maskBlob: Blob) {
  const formData = new FormData();
  formData.set("image", new File([imageBlob], "swapr-photo-source.png"));
  formData.set("mask", new File([maskBlob], "swapr-photo-mask.png"));

  const response = await fetch("/api/swapr/photos/expand", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      message?: string;
    } | null;

    throw new Error(body?.message ?? "Unable to AI-expand this photo.");
  }

  return response.blob();
}
