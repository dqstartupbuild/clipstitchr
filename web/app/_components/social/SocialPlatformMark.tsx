import { siInstagram, siTiktok } from "simple-icons";
import type { SocialPlatform } from "@/lib/clipstitchr/social/types/SocialPlatform";

type SocialPlatformMarkProps = {
  platform: SocialPlatform;
  className?: string;
};

export function SocialPlatformMark({
  platform,
  className = "h-5 w-5",
}: SocialPlatformMarkProps) {
  const icon = platform === "tiktok" ? siTiktok : siInstagram;

  return (
    <svg
      aria-label={icon.title}
      className={className}
      role="img"
      viewBox="0 0 24 24"
    >
      <path d={icon.path} fill="currentColor" />
    </svg>
  );
}
