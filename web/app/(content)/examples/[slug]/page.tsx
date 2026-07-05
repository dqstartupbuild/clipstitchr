import Link from "next/link";
import { notFound } from "next/navigation";
import { ExampleOutputVideoPlayer } from "@/app/_components/examples/ExampleOutputVideoPlayer";
import { getPublicVideoExampleBySlug } from "@/lib/clipstitchr/example-outputs/getPublicVideoExampleBySlug";
import { getPublicVideoExamples } from "@/lib/clipstitchr/example-outputs/getPublicVideoExamples";
import { createPublicVideoExampleMetadata } from "@/lib/clipstitchr/seo/createPublicVideoExampleMetadata";
import { createVideoObjectJsonLd } from "@/lib/clipstitchr/seo/createVideoObjectJsonLd";

type ExampleOutputPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getPublicVideoExamples().map((example) => ({
    slug: example.slug,
  }));
}

export async function generateMetadata({ params }: ExampleOutputPageProps) {
  const { slug } = await params;
  const example = getPublicVideoExampleBySlug(slug);

  if (!example) {
    return {};
  }

  return createPublicVideoExampleMetadata(example);
}

export default async function ExampleOutputPage({
  params,
}: ExampleOutputPageProps) {
  const { slug } = await params;
  const example = getPublicVideoExampleBySlug(slug);

  if (!example) {
    notFound();
  }

  return (
    <div className="marketing-grid-bg px-6 py-20 md:py-28">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(createVideoObjectJsonLd(example)),
        }}
      />

      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(260px,380px)] lg:items-start">
        <div>
          <Link
            href="/examples"
            className="text-sm font-semibold text-text-tertiary hover:text-accent-dark"
          >
            Back to examples
          </Link>

          <header className="mt-8">
            <p className="marketing-eyebrow">
              {example.kind}
            </p>
            <h1 className="marketing-heading mt-6 text-5xl text-text-primary md:text-7xl">
              {example.title}
            </h1>
            <p className="mt-6 text-lg leading-8 text-text-secondary">
              {example.description}
            </p>
          </header>

          <section className="marketing-card mt-10 p-6">
            <h2 className="marketing-subheading text-3xl text-text-primary">
              What this example shows
            </h2>
            <p className="mt-4 leading-8 text-text-secondary">
              This public example shows a {example.kind.toLowerCase()} created
              for a vertical short-form workflow. The same kind of output can be
              organized in the ClipStitchr library, reused as source footage, or
              paired with product demos depending on the workflow.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {example.tags.map((tag) => (
                <span
                  className="rounded-md border border-border bg-surface px-3 py-1 text-xs text-text-tertiary"
                  key={tag}
                >
                  {tag}
                </span>
              ))}
            </div>
          </section>

          <div className="mt-10">
            <Link
              href="/dashboard"
              prefetch={false}
              className="inline-flex items-center justify-center rounded-lg bg-accent px-5 py-3 text-sm font-bold text-white shadow-[0_0_24px_rgba(139,92,246,0.28)] transition-colors hover:bg-accent-light"
            >
              Open Dashboard
            </Link>
          </div>
        </div>

        <ExampleOutputVideoPlayer example={example} />
      </div>
    </div>
  );
}
