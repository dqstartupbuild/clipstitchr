export function createSwiprSocialCaption({
  caption,
  description,
  hashtags,
}: {
  caption: string;
  description: string;
  hashtags: string[];
}) {
  return [
    caption.trim(),
    description.trim(),
    hashtags
      .map((hashtag) => hashtag.trim())
      .filter(Boolean)
      .join(" "),
  ]
    .filter(Boolean)
    .join("\n\n");
}
