import Image from "next/image";
import instagramMark from "@/vendor/postiz/official_013db1da/upstream/apps/frontend/public/icons/platforms/instagram.png";
import tikTokMark from "@/vendor/postiz/official_013db1da/upstream/apps/frontend/public/icons/platforms/tiktok.png";
import youTubeMark from "@/vendor/postiz/official_013db1da/upstream/apps/frontend/public/icons/platforms/youtube.png";
import type { PublishingProvider } from "@/lib/clipstitchr/publishing/client/contracts/PublishingProvider";
import { getPublishingProviderName } from "@/lib/clipstitchr/publishing/client/getPublishingProviderName";

type PublishingProviderMarkProps = {
  provider: PublishingProvider;
  size?: number;
};

export function PublishingProviderMark({
  provider,
  size = 24,
}: PublishingProviderMarkProps) {
  return (
    <Image
      alt={`${getPublishingProviderName(provider)} logo`}
      className="publishing-provider-mark"
      height={size}
      src={
        provider === "instagram"
          ? instagramMark
          : provider === "tiktok"
            ? tikTokMark
            : youTubeMark
      }
      width={size}
    />
  );
}
