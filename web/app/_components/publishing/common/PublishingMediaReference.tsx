import type { PublishingMediaDescriptor } from "@/lib/clipstitchr/publishing/client/contracts/PublishingMediaDescriptor";

type PublishingMediaReferenceProps = {
  media: PublishingMediaDescriptor;
};

export function PublishingMediaReference({ media }: PublishingMediaReferenceProps) {
  const label =
    media.kind === "library-media"
      ? "Library media"
      : media.kind === "stitch"
        ? "Saved Stitch"
        : media.kind === "swipe"
          ? "Saved Swipe"
          : media.kind === "studio-clip-output"
            ? "Studio Clip output"
            : "Studio Stitch output";

  return (
    <div className="publishing-media-reference">
      <strong>{label}</strong>
      <span title={media.recordId}>{media.recordId}</span>
    </div>
  );
}
