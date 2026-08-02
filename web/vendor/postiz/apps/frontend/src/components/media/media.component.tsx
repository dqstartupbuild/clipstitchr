'use client';

import React, { FC, useCallback, useEffect, useState } from 'react';
import useSWR from 'swr';
import EventEmitter from 'events';
import { useFetch } from '@gitroom/helpers/utils/custom.fetch';
import { useMediaDirectory } from '@gitroom/react/helpers/use.media.directory';
import { useModals } from '@gitroom/frontend/components/layout/new-modal';
import { LoadingComponent } from '@gitroom/frontend/components/layout/loading';
import { Button } from '@gitroom/react/form/button';
import { useT } from '@gitroom/react/translation/get.transation.service.client';

interface ImportedMedia {
  id: string;
  path: string;
  alt?: string;
  thumbnail?: string;
  thumbnailTimestamp?: number;
  type?: string;
}

const showModalEmitter = new EventEmitter();

export const ShowMediaBoxModal: FC = () => {
  const modals = useModals();

  useEffect(() => {
    const open = (callback: (media: ImportedMedia[]) => void) => {
      modals.openModal({
        title: 'Media library',
        fullScreen: true,
        children: (close) => (
          <MediaBox
            closeModal={close}
            setMedia={(media) => callback(Array.isArray(media) ? media : [media])}
          />
        ),
      });
    };

    showModalEmitter.on('show', open);
    return () => {
      showModalEmitter.off('show', open);
    };
  }, [modals]);

  return null;
};

export const showMediaBox = (
  callback: (media: ImportedMedia[]) => void
) => showModalEmitter.emit('show', callback);

export const MediaBox: FC<{
  setMedia: (media: ImportedMedia | ImportedMedia[]) => void;
  closeModal: () => void;
  type?: 'image' | 'video';
}> = ({ setMedia, closeModal, type }) => {
  const fetch = useFetch();
  const mediaDirectory = useMediaDirectory();
  const load = useCallback(async () => {
    const response = await fetch('/media?page=1');
    const body = await response.json();
    return (body.results || body.media || body) as ImportedMedia[];
  }, [fetch]);
  const { data, isLoading } = useSWR('publishing-media-library', load, {
    revalidateOnFocus: false,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[280px] items-center justify-center">
        <LoadingComponent />
      </div>
    );
  }

  const visible = (data || []).filter((media) => {
    if (!type) return true;
    return media.type === type || media.path.toLowerCase().includes(type === 'video' ? '.mp4' : '.');
  });

  return (
    <div className="grid gap-[12px] sm:grid-cols-3 lg:grid-cols-5">
      {visible.map((media) => (
        <button
          className="overflow-hidden rounded-[8px] bg-newColColor text-start"
          key={media.id}
          onClick={() => {
            setMedia(media);
            closeModal();
          }}
          type="button"
        >
          {media.path.toLowerCase().includes('.mp4') ? (
            <video
              className="aspect-square w-full object-cover"
              muted
              preload="metadata"
              src={mediaDirectory.set(media.path)}
            />
          ) : (
            <img
              alt={media.alt || ''}
              className="aspect-square w-full object-cover"
              src={mediaDirectory.set(media.thumbnail || media.path)}
            />
          )}
        </button>
      ))}
    </div>
  );
};

export const MultiMediaComponent: FC<{
  label: string;
  description: string;
  mediaNotAvailable?: boolean;
  allData: { content: string; id?: string; image?: ImportedMedia[] }[];
  value?: ImportedMedia[];
  text: string;
  name: string;
  error?: unknown;
  onOpen?: () => void;
  onClose?: () => void;
  toolBar?: React.ReactNode;
  information?: React.ReactNode;
  onChange: (event: {
    target: { name: string; value?: ImportedMedia[] };
  }) => void;
}> = ({
  name,
  error,
  onChange,
  value,
  toolBar,
  information,
  mediaNotAvailable,
}) => {
  const [currentMedia, setCurrentMedia] = useState(value || []);
  const modals = useModals();
  const mediaDirectory = useMediaDirectory();
  const t = useT();

  useEffect(() => setCurrentMedia(value || []), [value]);

  const update = useCallback(
    (next: ImportedMedia[]) => {
      setCurrentMedia(next);
      onChange({ target: { name, value: next } });
    },
    [name, onChange]
  );

  const showModal = useCallback(() => {
    modals.openModal({
      title: t('media_library', 'Media library'),
      fullScreen: true,
      children: (close) => (
        <MediaBox
          closeModal={close}
          setMedia={(media) =>
            update([...currentMedia, ...(Array.isArray(media) ? media : [media])])
          }
        />
      ),
    });
  }, [currentMedia, modals, t, update]);

  return (
    <div className="flex flex-col gap-[8px]">
      <div className="flex flex-wrap gap-[10px] px-[12px]">
        {currentMedia.map((media, index) => (
          <div className="relative h-[44px] w-[44px]" key={`${media.id}-${index}`}>
            <img
              alt={media.alt || ''}
              className="h-full w-full rounded-[4px] object-cover"
              src={mediaDirectory.set(media.thumbnail || media.path)}
            />
            <button
              aria-label="Remove media"
              className="absolute end-0 top-0 bg-newBgColorInner px-[4px]"
              onClick={() => update(currentMedia.filter((_, itemIndex) => itemIndex !== index))}
              type="button"
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-[8px] border-t border-newColColor px-[12px] py-[10px]">
        {!mediaNotAvailable && (
          <Button onClick={showModal}>{t('insert_media', 'Insert media')}</Button>
        )}
        {toolBar}
        <div className="ms-auto">{information}</div>
      </div>
      {Boolean(error) && <div className="text-[12px] text-red-400">{String(error)}</div>}
    </div>
  );
};

export const MediaComponent: FC<{
  label: string;
  description: string;
  value?: ImportedMedia;
  name: string;
  onChange: (event: { target: { name: string; value?: ImportedMedia } }) => void;
  type?: 'image' | 'video';
  width?: number;
  height?: number;
}> = ({ label, description, value, name, onChange, type }) => {
  const modals = useModals();

  const choose = useCallback(() => {
    modals.openModal({
      title: 'Media library',
      fullScreen: true,
      children: (close) => (
        <MediaBox
          closeModal={close}
          type={type}
          setMedia={(media) =>
            onChange({
              target: {
                name,
                value: Array.isArray(media) ? media[0] : media,
              },
            })
          }
        />
      ),
    });
  }, [modals, name, onChange, type]);

  return (
    <div className="flex flex-col gap-[8px]">
      <div className="text-[14px]">{label}</div>
      <div className="text-[12px]">{description}</div>
      {value && <div className="truncate text-[12px]">{value.path}</div>}
      <div className="flex gap-[6px]">
        <Button onClick={choose}>Select</Button>
        <Button
          onClick={() => onChange({ target: { name, value: undefined } })}
          secondary
        >
          Clear
        </Button>
      </div>
    </div>
  );
};
