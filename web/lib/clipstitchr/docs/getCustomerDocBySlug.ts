import { getCustomerDocs } from "@/lib/clipstitchr/docs/getCustomerDocs";

export function getCustomerDocBySlug(slug: string) {
  return getCustomerDocs().find((doc) => doc.slug === slug);
}
