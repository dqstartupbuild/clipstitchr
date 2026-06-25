import Link from "next/link";
import { BrandMark } from "@/app/_components/BrandMark";
import { HeaderAuthActions } from "@/app/_components/HeaderAuthActions";

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
          ? "site-header-translucent fixed left-0 right-0 top-0 border-b border-border backdrop-blur-xl"
          : "border-b border-border bg-surface"
      }`}
    >
      <BrandMark />

      <div className="hidden items-center gap-6 text-sm text-text-secondary lg:flex">
        {isLanding ? (
          <>
            <a
              href="#workflow"
              className="font-semibold transition-colors hover:text-text-primary"
            >
              How it works
            </a>
            <a
              href="#examples"
              className="font-semibold transition-colors hover:text-text-primary"
            >
              Examples
            </a>
            <Link
              href="/case-studies"
              className="font-semibold transition-colors hover:text-text-primary"
            >
              Case Studies
            </Link>
            <Link
              href="/pricing"
              className="font-semibold transition-colors hover:text-text-primary"
            >
              Pricing
            </Link>
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
              href="/case-studies"
              className="font-semibold transition-colors hover:text-text-primary"
            >
              Case Studies
            </Link>
            <Link
              href="/examples"
              className="font-semibold transition-colors hover:text-text-primary"
            >
              Examples
            </Link>
            <Link
              href="/pricing"
              className="font-semibold transition-colors hover:text-text-primary"
            >
              Pricing
            </Link>
            <Link
              href="/dashboard"
              className="font-semibold transition-colors hover:text-text-primary"
            >
              Dashboard
            </Link>
          </>
        )}
        <HeaderAuthActions />
      </div>

      <div className="lg:hidden">
        <HeaderAuthActions variant="mobile" />
      </div>
    </nav>
  );
}