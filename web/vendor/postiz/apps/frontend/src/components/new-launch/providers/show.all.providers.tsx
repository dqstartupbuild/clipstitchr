'use client';

import React, { FC, forwardRef, useImperativeHandle } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useLaunchStore } from '@gitroom/frontend/components/new-launch/store';
import { GeneralPreviewComponent } from '@gitroom/frontend/components/launches/general.preview.component';
import { IntegrationContext } from '@gitroom/frontend/components/launches/helpers/use.integration';
import { useT } from '@gitroom/react/translation/get.transation.service.client';
import InstagramProvider from '@gitroom/frontend/components/new-launch/providers/instagram/instagram.collaborators';
import TiktokProvider from '@gitroom/frontend/components/new-launch/providers/tiktok/tiktok.provider';

export const Providers = [
  {
    identifier: 'instagram',
    component: InstagramProvider,
  },
  {
    identifier: 'instagram-standalone',
    component: InstagramProvider,
  },
  {
    identifier: 'tiktok',
    component: TiktokProvider,
  },
];

export const ShowAllProviders = forwardRef((props, ref) => {
  const { date, current, global, selectedIntegrations, allIntegrations } =
    useLaunchStore(
      useShallow((state) => ({
        date: state.date,
        selectedIntegrations: state.selectedIntegrations,
        allIntegrations: state.integrations,
        current: state.current,
        global: state.global,
      }))
    );

  const t = useT();

  useImperativeHandle(ref, () => ({
    checkAllValid: async () =>
      Promise.all(
        selectedIntegrations.map(async (provider) =>
          provider.ref?.current.isValid()
        )
      ),
    getAllValues: async () =>
      Promise.all(
        selectedIntegrations.map(async (provider) =>
          provider.ref?.current.getValues()
        )
      ),
    triggerAll: () =>
      selectedIntegrations.map(async (provider) =>
        provider.ref?.current.trigger()
      ),
  }));

  return (
    <div className="w-full flex flex-col flex-1">
      {current === 'global' && (
        <IntegrationContext.Provider
          value={{
            date,
            integration:
              selectedIntegrations?.[0]?.integration || allIntegrations?.[0],
            allIntegrations: selectedIntegrations.map(
              (provider) => provider.integration
            ),
            value: global.map((post) => ({
              id: post.id,
              content: post.content,
              image: post.media,
            })),
          }}
        >
          {global?.[0]?.content?.length === 0 ? (
            <div>
              {t(
                'start_writing_your_post',
                'Start writing your post for a preview'
              )}
            </div>
          ) : (
            <div className="border border-borderPreview rounded-[12px] shadow-previewShadow">
              <GeneralPreviewComponent maximumCharacters={100000000} />
            </div>
          )}
        </IntegrationContext.Provider>
      )}
      {selectedIntegrations.map((integration) => {
        const { component: ProviderComponent } = Providers.find(
          (provider) =>
            provider.identifier === integration.integration.identifier
        ) || { component: Empty };

        return (
          <ProviderComponent
            ref={integration.ref}
            key={integration.integration.id}
            id={integration.integration.id}
          />
        );
      })}
    </div>
  );
});

export const Empty: FC = () => null;
