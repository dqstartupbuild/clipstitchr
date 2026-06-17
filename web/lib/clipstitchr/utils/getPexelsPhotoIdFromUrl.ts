export function getPexelsPhotoIdFromUrl(value?: string) {
  const matches = value?.match(/\d+/g);
  const lastMatch = matches?.at(-1);
  const id = lastMatch ? Number(lastMatch) : NaN;

  return Number.isFinite(id) && id > 0 ? id : null;
}
