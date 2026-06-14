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
              href="#scores"
              className="font-semibold transition-colors hover:text-text-primary"
            >
              Scores
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
            <Link
              href="/examples"
              className="font-semibold transition-colors hover:text-text-primary"
            >
              Examples
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
              href="/examples"
              className="font-semibold transition-colors hover:text-text-primary"
            >
              Examples
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

      <div className="sm:hidden">
        <HeaderAuthActions variant="mobile" />
      </div>
    </nav>
  );
}
