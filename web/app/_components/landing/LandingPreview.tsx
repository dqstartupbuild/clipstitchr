import Image from "next/image";
import { Panel } from "@/app/_components/ui/Panel";

export function LandingPreview() {
  return (
    <section className="px-6 py-16">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.88fr_1.12fr] lg:items-center">
        <div>
          <p className="text-sm font-semibold text-accent-dark">
            Local workspace
          </p>
          <h2 className="mt-3 text-3xl font-bold text-text-primary md:text-4xl">
            A compact dashboard for real upload-to-export work.
          </h2>
          <p className="mt-4 leading-7 text-text-secondary">
            The MVP keeps originals out of the app library. Clips become usable
            only after Media Bunny produces normalized 1080 x 1920 versions in
            IndexedDB.
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
