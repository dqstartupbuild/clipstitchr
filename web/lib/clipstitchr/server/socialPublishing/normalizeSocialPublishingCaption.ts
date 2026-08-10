export function normalizeSocialPublishingCaption(value: string) {
  const caption = value.trim();

  if (!caption) {
    throw new Error("Add a caption before scheduling.");
  }

  return caption;
}
