export function getPublishingTikTokUnavailableInteractions({
  commentsDisabled,
  duetDisabled,
  stitchDisabled,
}: {
  commentsDisabled: boolean;
  duetDisabled: boolean;
  stitchDisabled: boolean;
}) {
  return [
    commentsDisabled ? "comments" : null,
    duetDisabled ? "Duet" : null,
    stitchDisabled ? "Stitch" : null,
  ].filter((label): label is string => label !== null);
}
