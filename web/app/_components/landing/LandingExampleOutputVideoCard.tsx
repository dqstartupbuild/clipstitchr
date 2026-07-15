import type { PublicVideoExample } from "@/lib/clipstitchr/types/PublicVideoExample";

type LandingExampleOutputVideoCardProps = {
  example: PublicVideoExample;
  shouldLoad: boolean;
};

export function LandingExampleOutputVideoCard({
  example,
  shouldLoad,
}: LandingExampleOutputVideoCardProps) {
  return (
    <article className="landing-reel-frame">
      <video
        aria-label={example.title}
        autoPlay={shouldLoad}
        loop
        muted
        playsInline
        poster={example.thumbnailSrc}
        preload={shouldLoad ? "metadata" : "none"}
      >
        <source src={example.videoSrc} type="video/webm" />
        Your browser does not support embedded video.
      </video>
      <div className="landing-reel-caption">
        <span>{example.kind}</span>
        <span>{example.durationSeconds}s</span>
      </div>
    </article>
  );
}
