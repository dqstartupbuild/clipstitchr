import Link from "next/link";
import { BrandMark } from "@/app/_components/BrandMark";
import { site } from "@/lib/site";

const footerColumns = [
  {
    heading: "Product",
    links: [
      { href: "/", label: "Features" },
      { href: "/examples", label: "Examples" },
      { href: "/pricing", label: "Pricing" },
      { href: "/dashboard", label: "Dashboard" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { href: "/docs", label: "Docs" },
      { href: "/blog", label: "Blog" },
      { href: "/case-studies", label: "Case studies" },
    ],
  },
  {
    heading: "Company",
    links: [
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
    ],
  },
];

/** Shared site footer used across all pages. */
export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface px-6 py-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 md:flex-row md:items-start md:justify-between">
        <div className="max-w-sm">
          <BrandMark />
          <p className="mt-4 text-sm leading-6 text-text-secondary">
            {site.defaultDescription}
          </p>
        </div>
        <nav className="grid grid-cols-2 gap-8 text-sm sm:grid-cols-3">
          {footerColumns.map((column) => (
            <div className="flex flex-col gap-3" key={column.heading}>
              <p className="text-xs font-bold text-text-primary">
                {column.heading}
              </p>
              {column.links.map((link) => (
                <Link
                  href={link.href}
                  className="text-text-secondary transition-colors hover:text-text-primary"
                  key={link.href}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          ))}
        </nav>
      </div>
      <div className="mx-auto mt-10 flex max-w-6xl flex-col gap-3 border-t border-border pt-6 text-xs text-text-tertiary md:flex-row md:items-center md:justify-between">
        <p>© {new Date().getFullYear()} {site.name}. All rights reserved.</p>
        <p>Built for indie builders worldwide.</p>
      </div>
    </footer>
  );
}
