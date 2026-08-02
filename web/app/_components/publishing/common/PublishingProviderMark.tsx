import Image from "next/image";
import instagramMark from "@/vendor/postiz/apps/frontend/public/icons/platforms/instagram.png";
import tikTokMark from "@/vendor/postiz/apps/frontend/public/icons/platforms/tiktok.png";
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
      src={provider === "instagram" ? instagramMark : tikTokMark}
      width={size}
    />
  );
}
