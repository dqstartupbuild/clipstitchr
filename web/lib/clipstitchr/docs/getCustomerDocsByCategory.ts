import type { CustomerDocCategory } from "@/lib/clipstitchr/docs/CustomerDocCategory";
import { getCustomerDocs } from "@/lib/clipstitchr/docs/getCustomerDocs";

export function getCustomerDocsByCategory(category: CustomerDocCategory) {
  return getCustomerDocs().filter((doc) => doc.category === category);
}
