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
    <div className="px-6 py-16 md:py-24">
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
            className="text-sm font-semibold text-text-tertiary hover:text-accent"
          >
            Back to examples
          </Link>

          <header className="mt-8">
            <p className="text-sm font-semibold text-accent-dark">
              {example.kind}
            </p>
            <h1 className="mt-4 text-4xl font-bold text-text-primary md:text-5xl">
              {example.title}
            </h1>
            <p className="mt-6 text-lg leading-8 text-text-secondary">
              {example.description}
            </p>
          </header>

          <section className="mt-10 rounded-lg border border-border bg-surface p-6">
            <h2 className="text-2xl font-bold text-text-primary">
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
                  className="rounded-md border border-border bg-white px-3 py-1 text-xs text-text-tertiary"
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
              className="inline-flex items-center justify-center rounded-lg bg-accent px-5 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-accent-dark"
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
