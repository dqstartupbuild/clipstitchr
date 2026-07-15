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
    <Link className="tool-discovery-card" href={href}>
      <p>{eyebrow}</p>
      <h3>{name}</h3>
      <p>{description}</p>
      <span>
        {linkLabel}
        <ArrowRight aria-hidden />
      </span>
    </Link>
  );
}
