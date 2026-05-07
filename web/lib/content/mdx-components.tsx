import type { ComponentPropsWithoutRef } from "react";
import { site } from "@/lib/site";

function CallToAction() {
  return (
    <div className="rounded-2xl border border-border bg-surface p-6">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
        {site.ctaLabel}
      </p>
      <p className="mt-3 text-base leading-7 text-text-secondary">
        Interested in what we&apos;re building? We&apos;d love to hear from you.
        Click the link below to get started.
      </p>
      <a
        href={site.ctaUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-primary mt-5"
      >
        {site.ctaLabel}
      </a>
    </div>
  );
}

function InlineLink(props: ComponentPropsWithoutRef<"a">) {
  return (
    <a
      {...props}
      className="text-accent underline decoration-accent/40 underline-offset-4 transition-colors hover:text-accent-light"
    />
  );
}

export const mdxComponents = {
  a: InlineLink,
  h2: (props: ComponentPropsWithoutRef<"h2">) => (
    <h2 {...props} className="mt-12 text-3xl font-semibold text-text-primary" />
  ),
  h3: (props: ComponentPropsWithoutRef<"h3">) => (
    <h3 {...props} className="mt-10 text-2xl font-semibold text-text-primary" />
  ),
  p: (props: ComponentPropsWithoutRef<"p">) => (
    <p {...props} className="text-base leading-8 text-text-secondary" />
  ),
  ul: (props: ComponentPropsWithoutRef<"ul">) => (
    <ul {...props} className="ml-6 list-disc space-y-3 text-text-secondary" />
  ),
  ol: (props: ComponentPropsWithoutRef<"ol">) => (
    <ol {...props} className="ml-6 list-decimal space-y-3 text-text-secondary" />
  ),
  blockquote: (props: ComponentPropsWithoutRef<"blockquote">) => (
    <blockquote
      {...props}
      className="border-l-4 border-accent pl-5 italic text-text-primary"
    />
  ),
  code: (props: ComponentPropsWithoutRef<"code">) => (
    <code
      {...props}
      className="rounded bg-surface-elevated px-1.5 py-1 font-mono text-[0.95em] text-text-primary"
    />
  ),
  pre: (props: ComponentPropsWithoutRef<"pre">) => (
    <pre
      {...props}
      className="overflow-x-auto rounded-2xl border border-border bg-surface-elevated p-5"
    />
  ),
  CallToAction,
};
