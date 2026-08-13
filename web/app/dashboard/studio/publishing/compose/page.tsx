import { PublishingComposer } from "@/app/_components/publishing/compose/PublishingComposer";
import { parsePublishingMediaDescriptorSearchParams } from "@/lib/clipstitchr/publishing/client/parsePublishingMediaDescriptorSearchParams";
import { parsePublishingThumbnailSearchParams } from "@/lib/clipstitchr/publishing/client/parsePublishingThumbnailSearchParams";

type PublishingComposePageProps = {
  searchParams?: Promise<{
    kind?: string | string[];
    recordId?: string | string[];
    thumbnailKind?: string | string[];
    thumbnailRecordId?: string | string[];
    thumbnailRevision?: string | string[];
  }>;
};

export default async function PublishingComposePage({
  searchParams = Promise.resolve({}),
}: PublishingComposePageProps = {}) {
  const resolvedSearchParams = await searchParams;
  return (
    <PublishingComposer
      mediaPrefill={parsePublishingMediaDescriptorSearchParams(
        resolvedSearchParams,
      )}
      thumbnailPrefill={parsePublishingThumbnailSearchParams(
        resolvedSearchParams,
      )}
    />
  );
}
