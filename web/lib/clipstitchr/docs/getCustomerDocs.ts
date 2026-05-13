import { customerDocs } from "@/lib/clipstitchr/docs/customerDocs";

export function getCustomerDocs() {
  return [...customerDocs].sort((left, right) => left.order - right.order);
}
