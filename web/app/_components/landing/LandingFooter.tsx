import Image from "next/image";
import Link from "next/link";
import { site } from "@/lib/site";

const landingFooterLinks = [
  { href: "/examples", label: "Examples" },
  { href: "/pricing", label: "Pricing" },
  { href: "/docs", label: "Docs" },
  { href: "/case-studies", label: "Case studies" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

export function LandingFooter() {
  return (
    <footer className="landing-footer">
      <div className="landing-footer-top">
        <Link className="landing-footer-brand" href="/">
          <Image
            alt={site.name}
            className="landing-footer-logo"
            height={550}
            src="/brand/logo-dark.png"
            width={2048}
          />
        </Link>
        <nav aria-label="Footer navigation" className="landing-footer-links">
          {landingFooterLinks.map((link) => (
            <Link href={link.href} key={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="landing-footer-meta">
        <p>© {new Date().getFullYear()} {site.name}</p>
        <p>Built for people shipping the product and the campaign.</p>
      </div>
    </footer>
  );
}
