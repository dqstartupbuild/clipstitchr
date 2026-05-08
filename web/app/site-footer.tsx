import Link from "next/link";
import { BrandMark } from "@/app/_components/BrandMark";
import { site } from "@/lib/site";

/** Shared site footer used across all pages. */
export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-white px-6 py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 md:flex-row md:items-start md:justify-between">
        <div className="max-w-md">
          <BrandMark />
          <p className="mt-4 text-sm leading-6 text-text-secondary">
            {site.defaultDescription}
          </p>
          <p className="mt-4 text-xs text-text-tertiary">
            © {new Date().getFullYear()} {site.name}. All rights reserved.
          </p>
        </div>
        <nav className="flex flex-wrap items-center gap-5 text-sm font-semibold text-text-secondary">
          <Link href="/" className="transition-colors hover:text-text-primary">
            Home
          </Link>
          <Link
            href="/blog"
            className="transition-colors hover:text-text-primary"
          >
            Blog
          </Link>
          <Link
            href="/privacy"
            className="transition-colors hover:text-text-primary"
          >
            Privacy Policy
          </Link>
          <Link
            href="/terms"
            className="transition-colors hover:text-text-primary"
          >
            Terms of Use
          </Link>
        </nav>
      </div>
    </footer>
  );
}
