import Link from "next/link";
import { BrandMark } from "@/app/_components/BrandMark";
import { HeaderAuthActions } from "@/app/_components/HeaderAuthActions";
import { PublicMobileNavigation } from "@/app/_components/navigation/PublicMobileNavigation";

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

  if (!isLanding) {
    return (
      <nav id="navbar" className="public-site-header">
        <div className="public-site-header-inner">
          <BrandMark />

          <div className="public-site-navigation" aria-label="Main navigation">
            <Link href="/">Product</Link>
            <Link href="/examples">Examples</Link>
            <Link href="/case-studies">Case studies</Link>
            <Link href="/tools">Tools</Link>
            <Link href="/docs">Docs</Link>
            <Link href="/blog">Blog</Link>
          </div>

          <div className="public-site-header-auth">
            <HeaderAuthActions />
          </div>

          <div className="public-site-header-mobile">
            <PublicMobileNavigation />
            <HeaderAuthActions variant="mobile" />
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav
      id="navbar"
      className="absolute left-0 right-0 top-0 z-50 flex items-center justify-between px-6 py-3"
    >
      <BrandMark />

      <div className="hidden items-center gap-6 text-sm text-text-secondary lg:flex">
        <a
          href="#workflow"
          className="font-semibold transition-colors hover:text-text-primary"
        >
          How it works
        </a>
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
        <HeaderAuthActions />
      </div>

      <div className="lg:hidden">
        <HeaderAuthActions variant="mobile" />
      </div>
    </nav>
  );
}
