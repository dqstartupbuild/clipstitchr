import { AppMarketingContentCalendarWorkspace } from "@/app/_components/tools/app-marketing-content-calendar/AppMarketingContentCalendarWorkspace";
import { ResourceFaq } from "@/app/_components/tools/resources/ResourceFaq";
import { ResourceGuide } from "@/app/_components/tools/resources/ResourceGuide";
import { ResourceHero } from "@/app/_components/tools/resources/ResourceHero";
import { ResourcePricingCta } from "@/app/_components/tools/resources/ResourcePricingCta";
import { ToolDiscoveryLinks } from "@/app/_components/tools/ToolDiscoveryLinks";
import { ToolLeadCaptureForm } from "@/app/_components/tools/ToolLeadCaptureForm";
import { ToolStructuredData } from "@/app/_components/tools/ToolStructuredData";
import { appMarketingCalendarFaqs } from "@/lib/clipstitchr/tools/appMarketingCalendar/appMarketingCalendarFaqs";
import { publicToolCatalog } from "@/lib/clipstitchr/tools/catalog/publicToolCatalog";

const tool = publicToolCatalog["app-marketing-content-calendar"];

export function AppMarketingContentCalendarPage() {
  return (
    <>
      <ToolStructuredData
        description={tool.description}
        faqs={appMarketingCalendarFaqs}
        name={tool.name}
        pathname={tool.pathname}
      />
      <ResourceHero resourceKey={tool.key} estimatedMinutes={5} />
      <AppMarketingContentCalendarWorkspace />
      <div className="px-6 pb-20">
        <div className="mx-auto max-w-4xl">
          <ToolLeadCaptureForm source={tool.key} />
        </div>
      </div>
      <ResourceGuide
        title="Give each publishing slot a clear job."
        paragraphs={[
          "The calendar rotates your channels, content pillars, and owners across the selected monthly cadence. A campaign date is kept even when it falls outside the normal posting weekdays.",
          "Treat the generated rows as a starting point. Assign the real source clip, adjust the status as work moves, and download the CSV before leaving the page.",
        ]}
      />
      <ResourceFaq faqs={appMarketingCalendarFaqs} />
      <ResourcePricingCta />
      <ToolDiscoveryLinks currentToolKey={tool.key} />
    </>
  );
}
