import Link from "next/link";
import { BrandMark } from "@/app/_components/BrandMark";
import { site } from "@/lib/site";

const footerLinks = [
  { href: "/examples", label: "Watch the work" },
  { href: "/case-studies", label: "See the proof" },
  { href: "/tools", label: "Plan the campaign" },
  { href: "/docs", label: "Read the field manual" },
  { href: "/blog", label: "Read the notes" },
  { href: "/pricing", label: "Choose a plan" },
] as const;

/** Shared site footer used across all pages. */
export function SiteFooter() {
  return (
    <footer className="public-site-footer">
      <div className="public-site-footer-grid">
        <div className="public-site-footer-brand">
          <BrandMark />
          <p>Raw clips in. A campaign you can actually publish out.</p>
        </div>
        <nav
          className="public-site-footer-index"
          aria-label="Footer navigation"
        >
          {footerLinks.map((link, index) => (
            <Link href={link.href} key={link.href}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="public-site-footer-meta">
        <p>
          © {new Date().getFullYear()} {site.name}. All rights reserved.
        </p>
        <div>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
        </div>
      </div>
    </footer>
  );
}
