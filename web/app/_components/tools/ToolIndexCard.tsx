import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

type ToolIndexCardProps = {
  description: string;
  eyebrow: string;
  href: string;
  icon: ReactNode;
  title: string;
};

export function ToolIndexCard({
  description,
  eyebrow,
  href,
  icon,
  title,
}: ToolIndexCardProps) {
  return (
    <article className="marketing-card flex h-full flex-col p-6 transition-colors hover:border-accent md:p-8">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent-dark">
        {icon}
      </div>
      <p className="mt-6 text-sm font-bold text-accent-dark">{eyebrow}</p>
      <h2 className="marketing-subheading mt-3 text-3xl text-text-primary">
        {title}
      </h2>
      <p className="mt-4 flex-1 leading-8 text-text-secondary">
        {description}
      </p>
      <Link
        href={href}
        className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-accent-dark transition-colors hover:text-accent"
      >
        Use this tool
        <ArrowRight aria-hidden className="h-4 w-4" />
      </Link>
    </article>
  );
}
