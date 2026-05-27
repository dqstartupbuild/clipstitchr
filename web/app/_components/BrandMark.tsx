import Image from "next/image";
import Link from "next/link";
import { site } from "@/lib/site";

export function BrandMark() {
  return (
    <Link
      href="/"
      className="relative inline-flex h-10 w-[10.25rem] shrink-0 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      <Image
        src="/brand/logo.png"
        alt={site.name}
        fill
        className="brand-mark-logo-light object-contain"
        sizes="164px"
        priority
      />
      <Image
        src="/brand/logo-dark.png"
        alt=""
        aria-hidden="true"
        fill
        className="brand-mark-logo-dark object-contain"
        sizes="164px"
        priority
      />
    </Link>
  );
}
