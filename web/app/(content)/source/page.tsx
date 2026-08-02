import Link from "next/link";
import { createPageMetadata } from "@/lib/metadata";
import { getCorrespondingSource } from "@/lib/clipstitchr/source/getCorrespondingSource";
import { site } from "@/lib/site";

export const metadata = createPageMetadata({
  title: `Source code | ${site.name}`,
  description:
    "Find the source code, license, attribution, and exact deployed revision for ClipStitchr.",
  canonical: "/source",
});

export default function SourcePage() {
  const source = getCorrespondingSource();

  return (
    <article className="legal-page">
      <div className="legal-document">
        <header className="legal-header">
          <p>Open source</p>
          <h1 className="marketing-heading">ClipStitchr source code</h1>
        </header>

        <div className="prose-legal">
          <section>
            <h2>Get the source</h2>
            <p>
              ClipStitchr is distributed under the GNU Affero General Public
              License version 3. The repository includes the application source,
              the selected Postiz-derived publishing source, build instructions,
              license notices, and a record of our modifications.
            </p>
            <p>
              <a href={source.revisionUrl}>Open the corresponding source</a>
              {source.archiveUrl ? (
                <>
                  {" "}or <a href={source.archiveUrl}>download the source archive</a>.
                </>
              ) : (
                "."
              )}
            </p>
            {source.revision ? (
              <p>
                Deployed revision: <code>{source.revision}</code>
              </p>
            ) : (
              <p>
                This development build does not identify an exact release
                revision. The repository link shows the available source, but a
                production release must publish its exact revision and archive.
              </p>
            )}
          </section>

          <section>
            <h2>License and attribution</h2>
            <p>
              The repository&apos;s <strong>LICENSE</strong>, <strong>NOTICE</strong>,
              <strong> THIRD_PARTY_NOTICES.md</strong>, and
              <strong> MODIFICATIONS.md</strong> files explain the license,
              upstream Postiz source, and material changes.
            </p>
            <p>
              Source-code rights do not grant rights to product or platform
              trademarks. The repository&apos;s <strong>TRADEMARKS.md</strong> file
              explains that boundary.
            </p>
          </section>

          <section>
            <h2>Questions</h2>
            <p>
              If a release link is missing or does not match the running
              application, please <Link href="/contact">contact us</Link> so we
              can correct it.
            </p>
          </section>
        </div>
      </div>
    </article>
  );
}
