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
      className="group overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_20px_55px_rgba(0,0,0,0.22)] transition-colors hover:border-accent"
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
        <p className="text-xs font-bold uppercase tracking-normal text-accent-dark">
          {example.kind}
        </p>
        <h2 className="marketing-subheading mt-2 text-xl text-text-primary group-hover:text-accent-dark">
          {example.title}
        </h2>
        <p className="mt-3 text-sm leading-6 text-text-secondary">
          {example.description}
        </p>
      </div>
    </Link>
  );
}
