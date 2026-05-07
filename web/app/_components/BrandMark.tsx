import Image from "next/image";
import Link from "next/link";
import { site } from "@/lib/site";

export function BrandMark() {
  return (
    <Link
      href="/"
      className="inline-flex items-center gap-2 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      <Image
        src="/brand/logo.png"
        alt={site.name}
        width={131}
        height={51}
        className="h-10 w-auto shrink-0 object-contain"
        priority
      />
    </Link>
  );
}
