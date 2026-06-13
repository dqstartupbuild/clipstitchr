export function createStitchSocialCaption({
  caption,
  hashtags,
}: {
  caption: string;
  hashtags: string[];
}) {
  return [
    caption.trim(),
    hashtags
      .map((hashtag) => hashtag.trim())
      .filter(Boolean)
      .join(" "),
  ]
    .filter(Boolean)
    .join("\n\n");
}
