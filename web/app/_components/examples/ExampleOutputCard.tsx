import Link from "next/link";
import { createPublicVideoExamplePath } from "@/lib/clipstitchr/example-outputs/createPublicVideoExamplePath";
import type { PublicVideoExample } from "@/lib/clipstitchr/types/PublicVideoExample";

type ExampleOutputCardProps = {
  example: PublicVideoExample;
  index: number;
};

export function ExampleOutputCard({ example, index }: ExampleOutputCardProps) {
  return (
    <Link
      href={createPublicVideoExamplePath(example)}
      className="example-output-card"
    >
      <div className="example-output-frame">
        <video
          aria-label={example.title}
          className="h-full w-full object-cover"
          muted
          playsInline
          poster={example.thumbnailSrc}
          preload="metadata"
          src={example.videoSrc}
        />
      </div>
      <div className="example-output-caption">
        <span>{String(index + 1).padStart(2, "0")}</span>
        <p>{example.kind}</p>
        <h2>{example.displayTitle}</h2>
        <p>{example.description}</p>
      </div>
    </Link>
  );
}
