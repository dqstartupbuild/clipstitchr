import Link from "next/link";
import { site } from "@/lib/site";

export function BlogEmptyState() {
  return (
    <div className="mt-14 rounded-lg border border-dashed border-border bg-slate-50 p-10 text-center">
      <p className="text-2xl font-bold text-text-primary">
        Nothing published yet.
      </p>
      <p className="mt-3 text-text-secondary">Working on it. Check back soon.</p>
      <Link
        href="/"
        className="mt-6 inline-flex h-10 items-center rounded-lg border border-border bg-white px-4 text-sm font-semibold text-text-primary hover:border-accent"
      >
        Back to {site.name}
      </Link>
    </div>
  );
}
