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
    <div className="example-detail-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(createVideoObjectJsonLd(example)),
        }}
      />

      <div className="example-detail-layout">
        <div className="example-detail-copy">
          <Link href="/examples" className="public-back-link">
            Back to examples
          </Link>

          <header className="example-detail-header">
            <p>{example.kind}</p>
            <h1 className="marketing-heading">{example.displayTitle}</h1>
            <p>{example.description}</p>
          </header>

          <section className="example-detail-note">
            <h2>What this example shows</h2>
            <p>
              This public example shows a {example.kind.toLowerCase()} created
              for a vertical short-form workflow. The same kind of output can be
              organized in the ClipStitchr library, reused as source footage, or
              paired with product demos depending on the workflow.
            </p>
            <div>
              {example.tags.map((tag, index) => (
                <span key={tag}>
                  {index > 0 ? " / " : ""}
                  {tag}
                </span>
              ))}
            </div>
          </section>

          <div className="example-detail-action">
            <Link
              href="/dashboard"
              className="public-primary-action inline-flex items-center justify-center bg-accent px-5 py-3 text-sm font-bold text-text-inverse transition-colors hover:bg-accent-light"
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
