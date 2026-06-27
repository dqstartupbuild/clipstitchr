export function getPostBridgeScheduleFile(formData: FormData) {
  const file = formData.get("media");

  if (!(file instanceof File)) {
    throw new Error("Choose a video before scheduling.");
  }

  return file;
}
