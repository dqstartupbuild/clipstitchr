import { createHomepageStructuredData } from "@/lib/clipstitchr/seo/createHomepageStructuredData";

export function LandingSeoStructuredData() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(createHomepageStructuredData()),
      }}
    />
  );
}
