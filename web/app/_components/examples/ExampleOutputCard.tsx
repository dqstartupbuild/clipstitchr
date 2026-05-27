import Link from "next/link";
import { createPublicVideoExamplePath } from "@/lib/clipstitchr/example-outputs/createPublicVideoExamplePath";
import type { PublicVideoExample } from "@/lib/clipstitchr/types/PublicVideoExample";

type ExampleOutputCardProps = {
  example: PublicVideoExample;
};

export function ExampleOutputCard({ example }: ExampleOutputCardProps) {
  return (
    <Link
      href={createPublicVideoExamplePath(example)}
      className="group overflow-hidden rounded-lg border border-border bg-surface shadow-sm transition-colors hover:border-accent"
    >
      <div className="aspect-[9/16] bg-surface-elevated">
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
      <div className="p-5">
        <p className="text-xs font-semibold uppercase tracking-normal text-accent-dark">
          {example.kind}
        </p>
        <h2 className="mt-2 text-lg font-bold leading-6 text-text-primary group-hover:text-accent">
          {example.title}
        </h2>
        <p className="mt-3 text-sm leading-6 text-text-secondary">
          {example.description}
        </p>
      </div>
    </Link>
  );
}
