import Link from "next/link";

const publicMobileLinks = [
  { href: "/", label: "Product" },
  { href: "/examples", label: "Examples" },
  { href: "/case-studies", label: "Case studies" },
  { href: "/tools", label: "Tools" },
  { href: "/docs", label: "Docs" },
  { href: "/blog", label: "Blog" },
  { href: "/pricing", label: "Pricing" },
] as const;

export function PublicMobileNavigation() {
  return (
    <details className="public-mobile-navigation">
      <summary>Menu</summary>
      <nav aria-label="Mobile navigation">
        {publicMobileLinks.map((link, index) => (
          <Link href={link.href} key={link.href}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            {link.label}
          </Link>
        ))}
      </nav>
    </details>
  );
}
