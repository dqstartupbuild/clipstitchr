'use client';

import React, { FC, useCallback } from 'react';
import { useFetch } from '@gitroom/helpers/utils/custom.fetch';
import { useModals } from '@gitroom/frontend/components/layout/new-modal';
import { useToaster } from '@gitroom/react/toaster/toaster';
import { useT } from '@gitroom/react/translation/get.transation.service.client';

const allowedProviders = new Set([
  'instagram',
  'instagram-standalone',
  'tiktok',
]);

interface AddProviderItem {
  identifier: string;
  name: string;
  toolTip?: string;
}

export const useAddProvider = () => {
  const modal = useModals();
  const fetch = useFetch();

  return useCallback(async () => {
    const data = await (await fetch('/integrations')).json();
    modal.openModal({
      title: 'Add channel',
      withCloseButton: true,
      children: (
        <AddProviderComponent
          social={data.social || []}
        />
      ),
    });
  }, [fetch, modal]);
};

export const AddProviderButton: FC = () => {
  const add = useAddProvider();
  const t = useT();

  return (
    <button
      className="flex h-[44px] items-center justify-center rounded-[8px] bg-btnSimple px-[16px] text-btnText"
      onClick={add}
      type="button"
    >
      {t('add_channel', 'Add channel')}
    </button>
  );
};

export const AddProviderComponent: FC<{
  social: AddProviderItem[];
  onboarding?: boolean;
  isMobile?: boolean;
}> = ({ social }) => {
  const fetch = useFetch();
  const toaster = useToaster();

  const connect = useCallback(
    (identifier: string) => async () => {
      const response = await fetch(`/integrations/social/${identifier}`);
      const { url, err } = await response.json();

      if (!response.ok || err || !url) {
        toaster.show('Could not start this connection. Please try again.', 'warning');
        return;
      }

      window.location.href = url;
    },
    [fetch, toaster]
  );

  return (
    <div className="grid gap-[10px] sm:grid-cols-2">
      {social
        .filter((provider) => allowedProviders.has(provider.identifier))
        .map((provider) => (
          <button
            className="flex min-h-[52px] items-center gap-[10px] rounded-[8px] bg-btnSimple px-[14px] text-start text-btnText"
            key={provider.identifier}
            onClick={connect(provider.identifier)}
            title={provider.toolTip}
            type="button"
          >
            <img
              alt=""
              height={24}
              src={`/icons/platforms/${provider.identifier}.png`}
              width={24}
            />
            <span>{provider.name}</span>
          </button>
        ))}
    </div>
  );
};
