export function getPostBridgeScheduleFiles(formData: FormData) {
  const files = formData
    .getAll("media")
    .filter((file): file is File => file instanceof File);

  if (!files.length) {
    throw new Error("Choose media before scheduling.");
  }

  return files;
}
