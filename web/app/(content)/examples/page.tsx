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
    <div className="examples-index-page">
      <div className="examples-index-inner">
        <header className="examples-index-hero">
          <p>{examples.length} finished outputs</p>
          <h1 className="marketing-heading">Clips become campaigns.</h1>
          <p>
            These are sample Stitchr, Clipr, and Swapr outputs. Use them to see
            how saved Hook/UGC clips and product demos can turn into short-form
            ads without starting from a blank editor.
          </p>
        </header>

        <section className="examples-film-strip" aria-label="Example outputs">
          {examples.map((example, index) => (
            <ExampleOutputCard
              example={example}
              index={index}
              key={example.id}
            />
          ))}
        </section>
      </div>
    </div>
  );
}
