import { createBreadcrumbJsonLd } from "@/lib/clipstitchr/seo/createBreadcrumbJsonLd";

export function createToolBreadcrumbJsonLd(name: string, pathname: string) {
  return createBreadcrumbJsonLd([
    { name: "Home", pathname: "/" },
    { name: "Tools", pathname: "/tools" },
    { name, pathname },
  ]);
}
