import Link from "next/link";
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
      className={`flex items-center justify-between px-6 py-4 backdrop-blur-xl z-50 ${
        isLanding ? "fixed top-0 left-0 right-0" : "border-b border-border"
      }`}
      style={{
        background: isLanding ? "rgba(12, 12, 14, 0.8)" : "var(--background)",
        ...(isLanding
          ? { borderBottom: "1px solid var(--border)" }
          : {}),
      }}
    >
      <Link href="/" className="flex items-center gap-2.5">
        <span className="text-base font-semibold tracking-tight text-text-primary">
          {site.name}
        </span>
      </Link>

      <div className="hidden sm:flex items-center gap-6 text-sm text-text-secondary">
        {isLanding ? (
          <>
            <a
              href="#features"
              className="transition-colors hover:text-text-primary"
            >
              Features
            </a>
            <Link
              href="/blog"
              className="transition-colors hover:text-text-primary"
            >
              Blog
            </Link>
          </>
        ) : (
          <>
            <Link
              href="/"
              className="transition-colors hover:text-text-primary"
            >
              Home
            </Link>
            <Link
              href="/blog"
              className="transition-colors hover:text-text-primary"
            >
              Blog
            </Link>
          </>
        )}
        <a
          href={site.ctaUrl}
          className="btn-primary !py-2 !px-5 !text-sm"
        >
          {site.ctaLabel}
        </a>
      </div>

      {/* Mobile CTA */}
      <div className="sm:hidden">
        <a
          href={site.ctaUrl}
          className="btn-primary !py-2 !px-4 !text-xs"
        >
          {site.ctaLabel}
        </a>
      </div>
    </nav>
  );
}
