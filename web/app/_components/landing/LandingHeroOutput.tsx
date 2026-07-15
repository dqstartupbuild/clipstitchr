import { getPublicVideoExamples } from "@/lib/clipstitchr/example-outputs/getPublicVideoExamples";

export function LandingHeroOutput() {
  const examples = getPublicVideoExamples().slice(0, 3);

  return (
    <div className="landing-hero-output" aria-label="Three finished ClipStitchr ads">
      {examples.map((example, index) => (
        <figure className="landing-hero-output-frame" key={example.id}>
          <video
            aria-label={example.title}
            autoPlay={index === 1}
            loop
            muted
            playsInline
            poster={example.thumbnailSrc}
            preload={index === 1 ? "metadata" : "none"}
          >
            <source src={example.videoSrc} type="video/webm" />
            Your browser does not support embedded video.
          </video>
          <figcaption>
            <span>{String(index + 1).padStart(2, "0")}</span>
            {example.durationSeconds}s finished ad
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
