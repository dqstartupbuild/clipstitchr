import type { ReactNode } from "react";
import Link from "next/link";
import { BrandMark } from "@/app/_components/BrandMark";
import { AuthProductPreview } from "@/app/_components/auth/AuthProductPreview";

type AuthPageShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
};

export function AuthPageShell({
  eyebrow,
  title,
  description,
  children,
}: AuthPageShellProps) {
  return (
    <main className="min-h-svh bg-background text-foreground">
      <div className="mx-auto grid min-h-svh w-full max-w-7xl lg:grid-cols-[1fr_440px]">
        <section className="flex flex-col justify-between px-6 py-8 sm:px-8 lg:min-h-svh lg:px-12">
          <BrandMark />
          <div className="py-12 lg:py-16">
            <p className="text-sm font-semibold text-accent-dark">{eyebrow}</p>
            <h1 className="mt-4 max-w-2xl text-4xl font-bold leading-tight text-text-primary md:text-5xl">
              {title}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-text-secondary md:text-lg">
              {description}
            </p>
            <div className="hidden lg:block">
              <AuthProductPreview />
            </div>
          </div>
          <div className="hidden items-center gap-4 text-sm font-semibold text-text-tertiary lg:flex">
            <Link
              href="/"
              className="transition-colors hover:text-text-primary"
            >
              Home
            </Link>
            <Link
              href="/docs"
              className="transition-colors hover:text-text-primary"
            >
              Docs
            </Link>
            <Link
              href="/privacy"
              className="transition-colors hover:text-text-primary"
            >
              Privacy
            </Link>
          </div>
        </section>
        <section className="flex items-center justify-center border-t border-border bg-white px-6 py-10 sm:px-8 lg:min-h-svh lg:border-l lg:border-t-0">
          {children}
        </section>
      </div>
    </main>
  );
}
