import Link from "next/link";

const discoveryLinks = [
  {
    href: "/tools",
    label: "Plan your next app ad",
    description: "Free hook, brief, and creative-testing tools for app teams.",
  },
  {
    href: "/examples",
    label: "Watch finished app ads",
    description: "See UGC-first, product-demo ad examples before you start.",
  },
  {
    href: "/blog",
    label: "Learn the workflow",
    description: "Practical guides for making more app ads without more editing.",
  },
] as const;

export function LandingDiscoverySection() {
  return (
    <nav className="landing-discovery" aria-label="Explore ClipStitchr resources">
      <div className="landing-discovery-inner">
        <p className="landing-section-intro">Build the next ad with less guesswork.</p>
        <ul className="landing-discovery-list">
          {discoveryLinks.map((link) => (
            <li key={link.href}>
              <Link href={link.href}>
                <span>{link.label}</span>
                <small>{link.description}</small>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
