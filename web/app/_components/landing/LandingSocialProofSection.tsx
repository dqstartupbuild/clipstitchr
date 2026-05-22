import { LandingSocialProofVideoCard } from "@/app/_components/landing/LandingSocialProofVideoCard";
import { landingSocialProofVideos } from "@/app/_components/landing/landingSocialProofVideos";

const marqueeRows = [0, 1];

export function LandingSocialProofSection() {
  return (
    <section
      aria-label="Example ClipStitchr exports"
      className="overflow-hidden px-0 py-12"
      id="real-output-reel"
    >
      <div className="landing-social-proof-marquee flex w-max">
        {marqueeRows.map((rowIndex) => (
          <div
            aria-hidden={rowIndex === 1}
            className="flex shrink-0 gap-4 pr-4"
            key={rowIndex}
          >
            {landingSocialProofVideos.map((video, index) => (
              <LandingSocialProofVideoCard
                key={`${rowIndex}-${video.src}`}
                index={index}
                video={video}
              />
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
