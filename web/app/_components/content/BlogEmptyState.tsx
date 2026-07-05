import Link from "next/link";
import { site } from "@/lib/site";

export function BlogEmptyState() {
  return (
    <div className="marketing-card mt-14 border-dashed p-10 text-center">
      <p className="marketing-subheading text-3xl text-text-primary">
        Nothing published yet.
      </p>
      <p className="mt-3 text-text-secondary">
        Writing useful things, not content theater. Check back soon.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex h-10 items-center rounded-lg border border-border bg-surface px-4 text-sm font-semibold text-text-primary hover:border-accent"
      >
        Back to {site.name}
      </Link>
    </div>
  );
}
