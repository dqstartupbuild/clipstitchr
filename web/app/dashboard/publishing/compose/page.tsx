import { PublishingComposer } from "@/app/_components/publishing/compose/PublishingComposer";
import { parsePublishingMediaDescriptorSearchParams } from "@/lib/clipstitchr/publishing/client/parsePublishingMediaDescriptorSearchParams";

type PublishingComposePageProps = {
  searchParams?: Promise<{
    kind?: string | string[];
    recordId?: string | string[];
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
    />
  );
}
