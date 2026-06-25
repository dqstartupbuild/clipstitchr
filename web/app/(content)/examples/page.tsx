import { ExampleOutputCard } from "@/app/_components/examples/ExampleOutputCard";
import { getPublicVideoExamples } from "@/lib/clipstitchr/example-outputs/getPublicVideoExamples";
import { createPageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

export const metadata = createPageMetadata({
  title: `Example Outputs | ${site.name}`,
  description:
    "Watch ClipStitchr examples made from saved clips, product demos, Clipr clips, and Swapr source material without starting from a blank editor.",
  canonical: "/examples",
  keywords: [
    "ClipStitchr examples",
    "UGC ad examples",
    "Stitchr examples",
    "Clipr examples",
    "Swapr examples",
  ],
});

export default function ExamplesIndexPage() {
  const examples = getPublicVideoExamples();

  return (
    <div className="px-6 py-16 md:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold text-accent-dark">
            Example outputs
          </p>
          <h1 className="mt-4 text-4xl font-bold text-text-primary md:text-5xl">
            See what happens when clips finally leave the folder.
          </h1>
          <p className="mt-6 text-lg leading-8 text-text-secondary">
            These are sample Stitchr, Clipr, and Swapr outputs. Use them to see
            how saved source clips and product demos can turn into short-form
            ads without starting from a blank editor.
          </p>
        </div>

        <section className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {examples.map((example) => (
            <ExampleOutputCard example={example} key={example.id} />
          ))}
        </section>
      </div>
    </div>
  );
}
