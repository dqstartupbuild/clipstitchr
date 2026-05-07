import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BrandMark } from "@/app/_components/BrandMark";
import { site } from "@/lib/site";

/**
 * Shared site header used across the landing page and content pages.
 *
 * @param variant
 *   - `"landing"` – fixed, transparent backdrop with section anchor links
 *   - `"content"` – static, solid background with page navigation links
 */
export function SiteHeader({
  variant = "content",
}: {
  variant?: "landing" | "content";
}) {
  const isLanding = variant === "landing";

  return (
    <nav
      id="navbar"
      className={`z-50 flex items-center justify-between px-6 py-4 ${
        isLanding
          ? "fixed left-0 right-0 top-0 border-b border-border bg-white/90 backdrop-blur-xl"
          : "border-b border-border bg-white"
      }`}
    >
      <BrandMark />

      <div className="hidden sm:flex items-center gap-6 text-sm text-text-secondary">
        {isLanding ? (
          <>
            <a
              href="#features"
              className="font-semibold transition-colors hover:text-text-primary"
            >
              Features
            </a>
            <a
              href="#workflow"
              className="font-semibold transition-colors hover:text-text-primary"
            >
              How it Works
            </a>
            <Link
              href="/blog"
              className="font-semibold transition-colors hover:text-text-primary"
            >
              Blog
            </Link>
            <span className="font-semibold text-text-tertiary">Pricing</span>
          </>
        ) : (
          <>
            <Link
              href="/"
              className="font-semibold transition-colors hover:text-text-primary"
            >
              Home
            </Link>
            <Link
              href="/blog"
              className="font-semibold transition-colors hover:text-text-primary"
            >
              Blog
            </Link>
            <Link
              href="/dashboard"
              className="font-semibold transition-colors hover:text-text-primary"
            >
              Dashboard
            </Link>
          </>
        )}
        <Link
          href={site.ctaUrl}
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-accent px-4 text-sm font-semibold text-white transition-colors hover:bg-accent-dark"
        >
          {site.ctaLabel}
          <ArrowRight aria-hidden className="h-4 w-4" />
        </Link>
      </div>

      <div className="sm:hidden">
        <Link
          href={site.ctaUrl}
          className="inline-flex h-9 items-center rounded-lg bg-accent px-3 text-xs font-semibold text-white"
        >
          Dashboard
        </Link>
      </div>
    </nav>
  );
}
