import { ProductDemoReadinessChecker } from "@/app/_components/tools/product-demo-readiness-checker/ProductDemoReadinessChecker";
import { ProductDemoReadinessFaq } from "@/app/_components/tools/product-demo-readiness-checker/ProductDemoReadinessFaq";
import { ProductDemoReadinessGuide } from "@/app/_components/tools/product-demo-readiness-checker/ProductDemoReadinessGuide";
import { ProductDemoReadinessHero } from "@/app/_components/tools/product-demo-readiness-checker/ProductDemoReadinessHero";
import { ToolDiscoveryLinks } from "@/app/_components/tools/ToolDiscoveryLinks";
import { ToolLeadCaptureForm } from "@/app/_components/tools/ToolLeadCaptureForm";
import { ToolStructuredData } from "@/app/_components/tools/ToolStructuredData";
import { productDemoReadinessDescription } from "@/lib/clipstitchr/tools/productDemoReadiness/productDemoReadinessDescription";
import { productDemoReadinessFaqs } from "@/lib/clipstitchr/tools/productDemoReadiness/productDemoReadinessFaqs";
import type { PublicToolPageGateProps } from "@/lib/clipstitchr/tools/catalog/PublicToolPageGateProps";

export function ProductDemoReadinessPage({
  variant = "control",
}: PublicToolPageGateProps) {
  return (
    <>
      <ToolStructuredData
        description={productDemoReadinessDescription}
        faqs={productDemoReadinessFaqs}
        name="Product Demo Readiness Checker"
        pathname="/tools/product-demo-readiness-checker"
      />
      <ProductDemoReadinessHero />
      <ProductDemoReadinessChecker variant={variant} />
      {variant === "control" ? (
        <div className="px-6 pb-20">
          <div className="mx-auto max-w-4xl">
            <ToolLeadCaptureForm source="product-demo-readiness-checker" />
          </div>
        </div>
      ) : null}
      <ProductDemoReadinessGuide />
      <ProductDemoReadinessFaq />
      <ToolDiscoveryLinks currentToolKey="product-demo-readiness-checker" />
    </>
  );
}
