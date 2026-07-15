import Image from "next/image";
import Link from "next/link";
import { brandAssets } from "@/lib/brandAssets";
import { site } from "@/lib/site";

export function BrandMark() {
  return (
    <Link
      href="/"
      className="brand-mark relative inline-flex h-10 w-[10.25rem] shrink-0 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      <Image
        src={brandAssets.logoOnDark}
        alt={site.name}
        fill
        className="object-contain"
        sizes="164px"
        priority
      />
    </Link>
  );
}
