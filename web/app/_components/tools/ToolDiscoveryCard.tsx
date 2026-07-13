import Link from "next/link";
import { ArrowRight } from "lucide-react";

type ToolDiscoveryCardProps = {
  description: string;
  eyebrow: string;
  href: string;
  linkLabel: string;
  name: string;
};

export function ToolDiscoveryCard({
  description,
  eyebrow,
  href,
  linkLabel,
  name,
}: ToolDiscoveryCardProps) {
  return (
    <Link
      className="marketing-card group flex h-full flex-col p-6 transition-colors hover:border-accent"
      href={href}
    >
      <p className="text-sm font-bold text-accent-dark">{eyebrow}</p>
      <h3 className="marketing-subheading mt-3 text-2xl text-text-primary">
        {name}
      </h3>
      <p className="mt-3 flex-1 leading-7 text-text-secondary">{description}</p>
      <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-accent-dark transition-colors group-hover:text-accent">
        {linkLabel}
        <ArrowRight aria-hidden className="h-4 w-4" />
      </span>
    </Link>
  );
}
