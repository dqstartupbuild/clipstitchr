let downloadUrlQueue = Promise.resolve();

export async function enqueueR2DownloadUrlRequest<T>(request: () => Promise<T>) {
  const downloadUrl = downloadUrlQueue.then(request, request);

  downloadUrlQueue = downloadUrl.then(
    () => undefined,
    () => undefined,
  );

  return await downloadUrl;
}
