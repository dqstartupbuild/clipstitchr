import { SocialPublishingAnalyticsFixture } from "./SocialPublishingAnalyticsFixture";
import { SocialPublishingComposeFixture } from "./SocialPublishingComposeFixture";
import { SocialPublishingConfirmationFixture } from "./SocialPublishingConfirmationFixture";
import { SocialPublishingDeliveryFixture } from "./SocialPublishingDeliveryFixture";
import { SocialPublishingQueueFixture } from "./SocialPublishingQueueFixture";
import { SocialPublishingScheduleFixture } from "./SocialPublishingScheduleFixture";

export function SocialPublishingBrowserAcceptanceHarness() {
  return (
    <main className="min-h-screen bg-background px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-6xl gap-6">
        <header>
          <h1 className="text-3xl font-bold text-text-primary sm:text-4xl">
            Social publishing acceptance workspace
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-text-secondary sm:text-base">
            A development-only browser surface for responsive, pointer, and
            keyboard checks. It uses fixture accounts and never contacts a
            social platform.
          </p>
        </header>
        <SocialPublishingComposeFixture />
        <SocialPublishingQueueFixture />
        <SocialPublishingScheduleFixture />
        <SocialPublishingDeliveryFixture />
        <SocialPublishingConfirmationFixture />
        <SocialPublishingAnalyticsFixture />
      </div>
    </main>
  );
}
