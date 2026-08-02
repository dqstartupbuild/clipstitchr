'use client';

import { CalendarWeekProvider } from '@gitroom/frontend/components/launches/calendar.context';
import { Calendar } from '@gitroom/frontend/components/launches/calendar';
import { Filters } from '@gitroom/frontend/components/launches/filters';
import { useIntegrationList } from '@gitroom/frontend/components/launches/helpers/use.integration.list';
import { LoadingComponent } from '@gitroom/frontend/components/layout/loading';

const allowedProviders = new Set([
  'instagram',
  'instagram-standalone',
  'tiktok',
]);

/**
 * Focused calendar/list shell derived from Postiz's LaunchesComponent.
 * Generator, onboarding, Web3, unrelated providers, and Postiz account chrome
 * are intentionally absent from the import boundary.
 */
export const LaunchesComponent = () => {
  const { data: integrations, isLoading } = useIntegrationList();

  if (isLoading) {
    return (
      <div className="flex min-h-[320px] flex-1 items-center justify-center">
        <LoadingComponent />
      </div>
    );
  }

  const publishingIntegrations = integrations.filter((integration: any) =>
    allowedProviders.has(integration.identifier)
  );

  return (
    <CalendarWeekProvider integrations={publishingIntegrations}>
      <div className="flex min-w-0 flex-1 flex-col bg-newBgColorInner">
        <Filters />
        <Calendar />
      </div>
    </CalendarWeekProvider>
  );
};
