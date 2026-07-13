import { ProductDemoReadinessPage } from "@/app/_components/tools/product-demo-readiness-checker/ProductDemoReadinessPage";
import { productDemoReadinessDescription } from "@/lib/clipstitchr/tools/productDemoReadiness/productDemoReadinessDescription";
import { publicToolCatalog } from "@/lib/clipstitchr/tools/catalog/publicToolCatalog";
import { createPageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

export const metadata = createPageMetadata({
  title: `Product Demo Readiness Checker | ${site.name}`,
  description: productDemoReadinessDescription,
  canonical: "/tools/product-demo-readiness-checker",
  keywords: publicToolCatalog["product-demo-readiness-checker"].keywords,
});

export default function ProductDemoReadinessRoutePage() {
  return <ProductDemoReadinessPage />;
}
