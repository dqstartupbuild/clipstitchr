import type { LandingSocialProofVideo } from "@/lib/clipstitchr/types/LandingSocialProofVideo";

type LandingSocialProofVideoCardProps = {
  index: number;
  video: LandingSocialProofVideo;
};

export function LandingSocialProofVideoCard({
  index,
  video,
}: LandingSocialProofVideoCardProps) {
  return (
    <article className="w-40 shrink-0 overflow-hidden rounded-lg bg-surface shadow-sm ring-1 ring-border sm:w-44 md:w-48">
      <div className="aspect-[9/16] bg-surface-elevated">
        <video
          aria-label={video.label}
          autoPlay
          className="h-full w-full object-cover"
          loop
          muted
          playsInline
          preload={index < 5 ? "auto" : "metadata"}
          src={video.src}
        />
      </div>
    </article>
  );
}
