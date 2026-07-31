"use client";

import { getProductInitials } from "@/lib/clipstitchr/utils/getProductInitials";
import { getProductLogoUrl } from "@/lib/clipstitchr/utils/getProductLogoUrl";

type ProductLogoProps = {
  name: string;
  websiteUrl?: string;
};

export function ProductLogo({ name, websiteUrl }: ProductLogoProps) {
  const logoUrl = getProductLogoUrl(websiteUrl);

  return (
    <span aria-hidden className="relative block size-full shrink-0">
      <span className="absolute inset-0 flex items-center justify-center rounded-lg border border-border bg-surface-muted text-xs font-bold text-accent-dark">
        {getProductInitials(name)}
      </span>
      {logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- Product websites have dynamic hosts that Next Image cannot safely enumerate.
        <img
          alt=""
          className="relative z-10 size-full rounded-lg bg-surface object-contain"
          decoding="async"
          key={logoUrl}
          referrerPolicy="no-referrer"
          src={logoUrl}
          onError={(event) => {
            event.currentTarget.hidden = true;
          }}
        />
      ) : null}
    </span>
  );
}
