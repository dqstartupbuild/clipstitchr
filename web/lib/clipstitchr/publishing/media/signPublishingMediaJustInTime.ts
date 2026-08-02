import { assertPublishingMediaFetchGrantReady } from "@/lib/clipstitchr/publishing/media/assertPublishingMediaFetchGrantReady";
import { getPublishingMediaFetchRequirements } from "@/lib/clipstitchr/publishing/media/getPublishingMediaFetchRequirements";
import type { PublishingMediaFetchGrant } from "@/lib/clipstitchr/publishing/media/PublishingMediaFetchGrant";
import type { PublishingMediaProvider } from "@/lib/clipstitchr/publishing/media/PublishingMediaProvider";
import type { PublishingMediaUrlSigner } from "@/lib/clipstitchr/publishing/media/PublishingMediaUrlSigner";
import type { ResolvedPublishingMediaSource } from "@/lib/clipstitchr/publishing/media/ResolvedPublishingMediaSource";
import type { PublishingMediaHeadClient } from "@/lib/clipstitchr/publishing/media/server/PublishingMediaHeadClient";
import { enrichPublishingMediaObjectWithR2Head } from "@/lib/clipstitchr/publishing/media/server/enrichPublishingMediaObjectWithR2Head";

type SignPublishingMediaJustInTimeOptions = {
  bucketName: string;
  headClient: PublishingMediaHeadClient;
  nowEpochMs?: number;
  provider: PublishingMediaProvider;
  quotaIdentity: string;
  signer: PublishingMediaUrlSigner;
  source: ResolvedPublishingMediaSource;
  verifiedClipStitchrOrigin?: string;
};

export async function signPublishingMediaJustInTime({
  bucketName,
  headClient,
  nowEpochMs,
  provider,
  quotaIdentity,
  signer,
  source,
  verifiedClipStitchrOrigin,
}: SignPublishingMediaJustInTimeOptions): Promise<
  readonly PublishingMediaFetchGrant[]
> {
  const requirements = getPublishingMediaFetchRequirements(provider);
  const grants = await Promise.all(
    source.mediaObjects.map(async (mediaObject) => {
      const verifiedMediaObject =
        await enrichPublishingMediaObjectWithR2Head({
          bucketName,
          descriptor: { kind: source.kind, recordId: source.recordId },
          headClient,
          mediaObject,
          ownerId: source.ownerId,
        });
      const grant = await signer.sign({
        ...(verifiedMediaObject.checksum
          ? { checksum: verifiedMediaObject.checksum }
          : {}),
        contentType: verifiedMediaObject.contentType,
        objectKey: verifiedMediaObject.objectKey,
        provider,
        quotaIdentity,
        requestedValiditySeconds: requirements.requestedValiditySeconds,
        sizeBytes: verifiedMediaObject.sizeBytes,
        ...(verifiedMediaObject.version
          ? { version: verifiedMediaObject.version }
          : {}),
      });

      return assertPublishingMediaFetchGrantReady(
        grant,
        provider,
        nowEpochMs ?? Date.now(),
        verifiedClipStitchrOrigin,
      );
    }),
  );

  return Object.freeze(grants);
}
