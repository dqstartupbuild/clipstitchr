import type { PublicVideoExample } from "@/lib/clipstitchr/types/PublicVideoExample";

type ExampleOutputVideoPlayerProps = {
  example: PublicVideoExample;
};

export function ExampleOutputVideoPlayer({
  example,
}: ExampleOutputVideoPlayerProps) {
  return (
    <figure className="example-detail-player">
      <video
        aria-label={example.title}
        className="aspect-[9/16] w-full object-cover"
        controls
        playsInline
        poster={example.thumbnailSrc}
        preload="metadata"
      >
        <source src={example.videoSrc} type="video/webm" />
      </video>
    </figure>
  );
}
