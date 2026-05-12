export async function getRemoteImageFile(url: string, fallbackFileName: string) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Unable to load the avatar reference image.");
  }

  const contentType = response.headers.get("content-type") ?? "image/jpeg";
  const body = await response.arrayBuffer();

  return new File([body], fallbackFileName, {
    type: contentType,
  });
}
