import Link from "next/link";
import { notFound } from "next/navigation";
import { createPageMetadata } from "@/lib/metadata";
import { getCustomerDocBySlug } from "@/lib/clipstitchr/docs/getCustomerDocBySlug";
import { getCustomerDocs } from "@/lib/clipstitchr/docs/getCustomerDocs";
import { site } from "@/lib/site";

type DocsArticlePageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getCustomerDocs().map((doc) => ({
    slug: doc.slug,
  }));
}

export async function generateMetadata({ params }: DocsArticlePageProps) {
  const { slug } = await params;
  const doc = getCustomerDocBySlug(slug);

  if (!doc) {
    return {};
  }

  return createPageMetadata({
    title: `${doc.title} Docs | ${site.name}`,
    description: doc.description,
    canonical: `/docs/${doc.slug}`,
  });
}

export default async function DocsArticlePage({ params }: DocsArticlePageProps) {
  const { slug } = await params;
  const doc = getCustomerDocBySlug(slug);
  const relatedDocs = getCustomerDocs().filter(
    (candidate) => candidate.slug !== slug,
  );

  if (!doc) {
    notFound();
  }

  return (
    <div className="px-6 py-16 md:py-24">
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <article className="min-w-0">
          <Link
            href="/docs"
            className="text-sm font-semibold text-text-tertiary transition-colors hover:text-accent"
          >
            Back to docs
          </Link>

          <header className="mt-8 max-w-3xl">
            <p className="text-sm font-semibold text-accent-dark">Docs</p>
            <h1 className="mt-4 text-4xl font-bold text-text-primary md:text-5xl">
              {doc.title}
            </h1>
            <p className="mt-6 text-lg leading-8 text-text-secondary">
              {doc.description}
            </p>
            <p className="mt-5 text-sm text-text-tertiary">
              Updated {doc.updated}
            </p>
          </header>

          <div className="mt-12 space-y-12">
            {doc.sections.map((section) => (
              <section key={section.title}>
                <h2 className="text-2xl font-bold text-text-primary">
                  {section.title}
                </h2>

                <div className="mt-4 space-y-4">
                  {section.body.map((paragraph) => (
                    <p
                      key={paragraph}
                      className="text-base leading-8 text-text-secondary"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>

                {section.bullets ? (
                  <ul className="mt-5 list-disc space-y-3 pl-5 text-base leading-7 text-text-secondary">
                    {section.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                ) : null}

                {section.cards ? (
                  <div className="mt-6 grid gap-4 md:grid-cols-2">
                    {section.cards.map((card) => {
                      const cardContent = (
                        <>
                          <h3 className="text-lg font-bold text-text-primary">
                            {card.title}
                          </h3>
                          <p className="mt-2 text-sm leading-6 text-text-secondary">
                            {card.description}
                          </p>
                        </>
                      );

                      return card.href ? (
                        <Link
                          key={card.title}
                          href={card.href}
                          className="rounded-lg border border-border bg-white p-5 shadow-sm transition-colors hover:border-accent"
                        >
                          {cardContent}
                        </Link>
                      ) : (
                        <div
                          key={card.title}
                          className="rounded-lg border border-border bg-white p-5 shadow-sm"
                        >
                          {cardContent}
                        </div>
                      );
                    })}
                  </div>
                ) : null}
              </section>
            ))}

            {doc.rateLimitGroups ? (
              <section>
                <h2 className="text-2xl font-bold text-text-primary">
                  Current Limits
                </h2>
                <div className="mt-6 space-y-8">
                  {doc.rateLimitGroups.map((group) => (
                    <div key={group.title}>
                      <h3 className="text-xl font-bold text-text-primary">
                        {group.title}
                      </h3>
                      <div className="mt-4 overflow-hidden rounded-lg border border-border bg-white">
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-border text-left text-sm">
                            <thead className="bg-surface-elevated text-text-primary">
                              <tr>
                                <th className="px-4 py-3 font-bold">Action</th>
                                <th className="px-4 py-3 font-bold">Limit</th>
                                <th className="px-4 py-3 font-bold">Note</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                              {group.rows.map((row) => (
                                <tr key={row.action}>
                                  <td className="px-4 py-3 font-semibold text-text-primary">
                                    {row.action}
                                  </td>
                                  <td className="px-4 py-3 text-text-secondary">
                                    {row.limit}
                                  </td>
                                  <td className="px-4 py-3 text-text-tertiary">
                                    {row.note ?? "Applies per user."}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        </article>

        <aside className="lg:pt-24">
          <div className="sticky top-8 rounded-lg border border-border bg-white p-5 shadow-sm">
            <p className="text-sm font-bold text-text-primary">More docs</p>
            <nav className="mt-4 space-y-2">
              {relatedDocs.map((relatedDoc) => (
                <Link
                  key={relatedDoc.slug}
                  href={`/docs/${relatedDoc.slug}`}
                  className="block rounded-md px-3 py-2 text-sm font-semibold text-text-secondary transition-colors hover:bg-surface-elevated hover:text-text-primary"
                >
                  {relatedDoc.title}
                </Link>
              ))}
            </nav>
          </div>
        </aside>
      </div>
    </div>
  );
}
