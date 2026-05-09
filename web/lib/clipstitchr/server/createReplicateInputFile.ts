export function createReplicateInputFile({
  fallbackFileName,
  file,
  mimeType,
}: {
  fallbackFileName: string;
  file: File;
  mimeType: string;
}) {
  return new File([file], file.name || fallbackFileName, {
    lastModified: file.lastModified,
    type: mimeType,
  });
}
