import { ArrowLeft } from "lucide-react";
import { SecondaryButtonLink } from "@/app/_components/SecondaryButtonLink";

type LibraryPageHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function LibraryPageHeader({
  eyebrow,
  title,
  description,
}: LibraryPageHeaderProps) {
  return (
    <header>
      <SecondaryButtonLink
        href="/dashboard"
        icon={<ArrowLeft aria-hidden className="h-4 w-4" />}
      >
        Dashboard
      </SecondaryButtonLink>
      <p className="mt-6 text-sm font-semibold text-accent-dark">{eyebrow}</p>
      <h1 className="mt-2 text-3xl font-bold text-text-primary">{title}</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
        {description}
      </p>
    </header>
  );
}
