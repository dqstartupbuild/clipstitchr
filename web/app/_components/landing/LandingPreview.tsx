import Image from "next/image";
import { Panel } from "@/app/_components/ui/Panel";

export function LandingPreview() {
  return (
    <section className="px-6 py-16">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.88fr_1.12fr] lg:items-center">
        <div>
          <p className="text-sm font-semibold text-accent-dark">
            One creative workspace
          </p>
          <h2 className="mt-3 text-3xl font-bold text-text-primary md:text-4xl">
            Keep every clip, photo, and finished video easy to find.
          </h2>
          <p className="mt-4 leading-7 text-text-secondary">
            Save UGC clips, product demos, and person photos in one place.
            Rename them, tag them, search across them, trim videos, preview
            everything, and keep finished stitches ready for reuse.
          </p>
        </div>
        <Panel className="overflow-hidden p-2">
          <Image
            src="/mockups/clipstitchr-product-mockup.png"
            alt="ClipStitchr dashboard and video stitching interface mockup"
            width={1536}
            height={1024}
            className="h-auto w-full rounded-md"
            sizes="(min-width: 1024px) 55vw, 100vw"
          />
        </Panel>
      </div>
    </section>
  );
}
