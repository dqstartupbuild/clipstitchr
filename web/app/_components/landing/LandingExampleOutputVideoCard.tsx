import type { PublicVideoExample } from "@/lib/clipstitchr/types/PublicVideoExample";

type LandingExampleOutputVideoCardProps = {
  example: PublicVideoExample;
  index: number;
};

export function LandingExampleOutputVideoCard({
  example,
  index,
}: LandingExampleOutputVideoCardProps) {
  return (
    <article className="w-40 shrink-0 overflow-hidden rounded-[1.5rem] bg-surface shadow-[0_20px_50px_rgba(0,0,0,0.28)] ring-1 ring-white/10 sm:w-44 md:w-48">
      <div className="aspect-[9/16] bg-surface-elevated">
        <video
          aria-label={example.title}
          autoPlay
          className="h-full w-full object-cover"
          loop
          muted
          playsInline
          poster={example.thumbnailSrc}
          preload={index < 5 ? "auto" : "metadata"}
          src={example.videoSrc}
        />
      </div>
    </article>
  );
}
