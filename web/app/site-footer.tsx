import Image from "next/image";
import Link from "next/link";
import { brandAssets } from "@/lib/brandAssets";
import { site } from "@/lib/site";

const footerLinks = [
  { href: "/examples", label: "Examples" },
  { href: "/pricing", label: "Pricing" },
  { href: "/docs", label: "Docs" },
  { href: "/case-studies", label: "Case studies" },
  { href: "/source", label: "Source" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
] as const;

/** Shared site footer used across all pages. */
export function SiteFooter() {
  return (
    <footer className="landing-footer">
      <div className="landing-footer-top">
        <Link className="landing-footer-brand" href="/">
          <Image
            alt={site.name}
            className="landing-footer-logo"
            height={550}
            src={brandAssets.logoOnDark}
            width={2545}
          />
        </Link>
        <nav aria-label="Footer navigation" className="landing-footer-links">
          {footerLinks.map((link) => (
            <Link href={link.href} key={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="landing-footer-meta">
        <p>
          © {new Date().getFullYear()} {site.name}
        </p>
        <p>Built for people shipping the product and the campaign.</p>
      </div>
    </footer>
  );
}
