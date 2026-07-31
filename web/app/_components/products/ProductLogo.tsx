"use client";

import { useEffect, useRef } from "react";
import { getProductInitials } from "@/lib/clipstitchr/utils/getProductInitials";
import { getProductLogoUrl } from "@/lib/clipstitchr/utils/getProductLogoUrl";

type ProductLogoProps = {
  name: string;
  websiteUrl?: string;
};

export function ProductLogo({ name, websiteUrl }: ProductLogoProps) {
  const logoUrl = getProductLogoUrl(websiteUrl);
  const imageRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    if (imageRef.current) {
      imageRef.current.hidden =
        !imageRef.current.complete || imageRef.current.naturalWidth === 0;
    }
  }, [logoUrl]);

  return (
    <span aria-hidden className="relative block size-full shrink-0">
      <span className="absolute inset-0 flex items-center justify-center rounded-lg border border-border bg-surface-muted text-xs font-bold text-accent-dark">
        {getProductInitials(name)}
      </span>
      {logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- Product websites have dynamic hosts that Next Image cannot safely enumerate.
        <img
          ref={imageRef}
          alt=""
          className="relative z-10 size-full rounded-lg bg-surface object-contain"
          decoding="async"
          hidden
          key={logoUrl}
          referrerPolicy="no-referrer"
          src={logoUrl}
          onError={(event) => {
            event.currentTarget.hidden = true;
          }}
          onLoad={(event) => {
            event.currentTarget.hidden = false;
          }}
        />
      ) : null}
    </span>
  );
}
