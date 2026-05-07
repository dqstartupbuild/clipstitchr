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
        src="/brand/icon.png"
        alt=""
        width={32}
        height={32}
        className="h-8 w-8 rounded-lg"
        priority
      />
      <span className="text-base font-bold text-text-primary">{site.name}</span>
    </Link>
  );
}
