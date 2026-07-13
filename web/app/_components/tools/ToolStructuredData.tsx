import type { ToolFaq } from "@/lib/clipstitchr/types/ToolFaq";
import { createToolFaqJsonLd } from "@/lib/clipstitchr/tools/createToolFaqJsonLd";
import { createToolWebApplicationJsonLd } from "@/lib/clipstitchr/tools/createToolWebApplicationJsonLd";

type ToolStructuredDataProps = {
  description: string;
  faqs: readonly ToolFaq[];
  name: string;
  pathname: string;
};

export function ToolStructuredData({
  description,
  faqs,
  name,
  pathname,
}: ToolStructuredDataProps) {
  const structuredData = [
    createToolWebApplicationJsonLd({ description, name, pathname }),
    createToolFaqJsonLd(faqs),
  ];

  return structuredData.map((data) => (
    <script
      key={data["@type"]}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  ));
}
