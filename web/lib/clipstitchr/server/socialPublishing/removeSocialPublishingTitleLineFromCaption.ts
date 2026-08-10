type RemoveSocialPublishingTitleLineFromCaptionOptions = {
  caption: string;
  title: string;
};

export function removeSocialPublishingTitleLineFromCaption({
  caption,
  title,
}: RemoveSocialPublishingTitleLineFromCaptionOptions) {
  const normalizedTitle = title.trim();

  if (!normalizedTitle) {
    return caption.trim();
  }

  const lines = caption.split(/\r?\n/);
  const titleLineIndex = lines.findIndex((line) => line.trim().length > 0);

  if (titleLineIndex < 0) {
    return "";
  }

  const titleLine = lines[titleLineIndex].trim();
  const isTitleLine =
    titleLine === normalizedTitle ||
    (normalizedTitle.length >= 100 && titleLine.startsWith(normalizedTitle));

  if (!isTitleLine) {
    return caption.trim();
  }

  return lines
    .slice(titleLineIndex + 1)
    .join("\n")
    .trim();
}
