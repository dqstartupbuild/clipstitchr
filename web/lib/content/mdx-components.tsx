import type { ComponentPropsWithoutRef } from "react";
import { MdxFigcaption } from "@/app/_components/content/MdxFigcaption";
import { MdxFigure } from "@/app/_components/content/MdxFigure";
import { MdxIframe } from "@/app/_components/content/MdxIframe";
import { MdxImage } from "@/app/_components/content/MdxImage";
import { MdxTable } from "@/app/_components/content/MdxTable";
import { MdxTableCell } from "@/app/_components/content/MdxTableCell";
import { MdxTableHeaderCell } from "@/app/_components/content/MdxTableHeaderCell";
import { site } from "@/lib/site";

type CallToActionProps = {
  href?: string;
  label?: string;
};

function CallToAction({
  href = site.ctaUrl,
  label = site.ctaLabel,
}: CallToActionProps) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-6">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
        {label}
      </p>
      <p className="mt-3 text-base leading-7 text-text-secondary">
        Interested in what we&apos;re building? We&apos;d love to hear from you.
        Click the link below to get started.
      </p>
      <a href={href} className="btn-primary mt-5">
        {label}
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
  figure: MdxFigure,
  figcaption: MdxFigcaption,
  iframe: MdxIframe,
  img: MdxImage,
  table: MdxTable,
  td: MdxTableCell,
  th: MdxTableHeaderCell,
  CallToAction,
};
