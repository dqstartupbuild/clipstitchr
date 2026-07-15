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
    <main className="marketing-shell auth-site-shell min-h-svh bg-background text-foreground">
      <div className="auth-page-layout">
        <section className="auth-page-story">
          <BrandMark />
          <div className="auth-page-copy">
            <p>{eyebrow}</p>
            <h1 className="marketing-heading">{title}</h1>
            <p>{description}</p>
          </div>
          <AuthProductPreview />
          <nav className="auth-page-links" aria-label="Account page links">
            <Link href="/">Home</Link>
            <Link href="/docs">Docs</Link>
            <Link href="/privacy">Privacy</Link>
          </nav>
        </section>
        <section className="auth-form-panel">{children}</section>
      </div>
    </main>
  );
}
