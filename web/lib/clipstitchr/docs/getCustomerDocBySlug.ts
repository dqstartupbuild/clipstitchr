import { getCustomerDocs } from "@/lib/clipstitchr/docs/getCustomerDocs";
import { legacyCustomerDocSlugs } from "@/lib/clipstitchr/docs/legacyCustomerDocSlugs";

export function getCustomerDocBySlug(slug: string) {
  const resolvedSlug = legacyCustomerDocSlugs[slug] ?? slug;

  return getCustomerDocs().find((doc) => doc.slug === resolvedSlug);
}
