import type { PublicVideoExample } from "@/lib/clipstitchr/types/PublicVideoExample";

type ExampleOutputVideoPlayerProps = {
  example: PublicVideoExample;
};

export function ExampleOutputVideoPlayer({
  example,
}: ExampleOutputVideoPlayerProps) {
  return (
    <div className="mx-auto w-full max-w-sm overflow-hidden rounded-[1.75rem] border border-white/10 bg-black shadow-[0_24px_70px_rgba(0,0,0,0.34)]">
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
    </div>
  );
}
