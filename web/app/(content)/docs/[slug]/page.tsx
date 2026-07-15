import Link from "next/link";
import { notFound } from "next/navigation";
import { CustomerDocCommandBlock } from "@/app/_components/docs/CustomerDocCommandBlock";
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

export default async function DocsArticlePage({
  params,
}: DocsArticlePageProps) {
  const { slug } = await params;
  const doc = getCustomerDocBySlug(slug);

  if (!doc) {
    notFound();
  }

  const relatedDocs = getCustomerDocs().filter(
    (candidate) => candidate.slug !== doc.slug,
  );

  return (
    <div className="docs-article-page">
      <div className="docs-article-layout">
        <article className="docs-article-body">
          <Link href="/docs" className="public-back-link">
            Back to docs
          </Link>

          <header className="docs-article-header">
            <p>Field manual / Updated {doc.updated}</p>
            <h1 className="marketing-heading">{doc.title}</h1>
            <p>{doc.description}</p>
          </header>

          <div className="docs-article-sections">
            {doc.sections.map((section) => (
              <section key={section.title}>
                <h2 className="marketing-subheading text-3xl text-text-primary">
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

                {section.commands ? (
                  <CustomerDocCommandBlock commands={section.commands} />
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
                          className="marketing-card p-5 transition-colors hover:border-accent"
                        >
                          {cardContent}
                        </Link>
                      ) : (
                        <div key={card.title} className="marketing-card p-5">
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
                <h2 className="marketing-subheading text-3xl text-text-primary">
                  Current Limits
                </h2>
                <div className="mt-6 space-y-8">
                  {doc.rateLimitGroups.map((group) => (
                    <div key={group.title}>
                      <h3 className="text-xl font-bold text-text-primary">
                        {group.title}
                      </h3>
                      <div className="mt-4 overflow-hidden rounded-lg border border-border bg-surface">
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

        <aside className="docs-article-aside">
          <div>
            <p>More field notes</p>
            <nav>
              {relatedDocs.map((relatedDoc) => (
                <Link
                  key={relatedDoc.slug}
                  href={`/docs/${relatedDoc.slug}`}
                  className="docs-article-aside-link"
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
