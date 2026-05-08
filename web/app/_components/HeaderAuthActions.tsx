import {
  Show,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { site } from "@/lib/site";

type HeaderAuthActionsProps = {
  variant?: "desktop" | "mobile";
};

export function HeaderAuthActions({
  variant = "desktop",
}: HeaderAuthActionsProps) {
  const isMobile = variant === "mobile";
  const secondaryButtonClassName = isMobile
    ? "inline-flex h-9 items-center rounded-lg px-2 text-xs font-semibold text-text-secondary"
    : "inline-flex h-10 items-center rounded-lg px-3 text-sm font-semibold text-text-secondary transition-colors hover:text-text-primary";
  const primaryButtonClassName = isMobile
    ? "inline-flex h-9 items-center rounded-lg bg-accent px-3 text-xs font-semibold text-white"
    : "inline-flex h-10 items-center gap-2 rounded-lg bg-accent px-4 text-sm font-semibold text-white transition-colors hover:bg-accent-dark";

  return (
    <div className="inline-flex items-center gap-2">
      <Show when="signed-out">
        <SignInButton>
          <button type="button" className={secondaryButtonClassName}>
            Sign in
          </button>
        </SignInButton>
        <SignUpButton>
          <button type="button" className={primaryButtonClassName}>
            Sign up
          </button>
        </SignUpButton>
      </Show>
      <Show when="signed-in">
        <Link href={site.ctaUrl} className={primaryButtonClassName}>
          {isMobile ? "Dashboard" : site.ctaLabel}
          {!isMobile && <ArrowRight aria-hidden className="h-4 w-4" />}
        </Link>
        <UserButton />
      </Show>
    </div>
  );
}
