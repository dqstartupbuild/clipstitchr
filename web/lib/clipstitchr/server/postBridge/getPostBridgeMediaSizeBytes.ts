export function getPostBridgeMediaSizeBytes(files: File[]) {
  return files.reduce((totalSize, file) => totalSize + file.size, 0);
}
