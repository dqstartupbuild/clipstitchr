export async function updateStudioClipsOutputHandoff(
  update: () => Promise<unknown>,
  onUpdated: () => void,
) {
  if (await update()) {
    onUpdated();
  }
}
