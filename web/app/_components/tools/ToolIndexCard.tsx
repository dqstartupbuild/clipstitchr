import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

type ToolIndexCardProps = {
  description: string;
  eyebrow: string;
  href: string;
  icon: ReactNode;
  index: number;
  title: string;
};

export function ToolIndexCard({
  description,
  eyebrow,
  href,
  icon,
  index,
  title,
}: ToolIndexCardProps) {
  return (
    <article className="tool-index-row">
      <span>{String(index + 1).padStart(2, "0")}</span>
      <div className="tool-index-icon">{icon}</div>
      <p>{eyebrow}</p>
      <h2>{title}</h2>
      <p>{description}</p>
      <Link href={href} className="tool-index-link">
        Use this tool
        <ArrowRight aria-hidden />
      </Link>
    </article>
  );
}
