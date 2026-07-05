import Image from "next/image";
import { Panel } from "@/app/_components/ui/Panel";

export function LandingPreview() {
  return (
    <section className="px-6 py-24">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.88fr_1.12fr] lg:items-center">
        <div>
          <p className="marketing-eyebrow">
            Main workflow
          </p>
          <h2 className="marketing-heading mt-5 text-4xl text-text-primary md:text-6xl">
            Use one product demo without dragging it into every ad yourself.
          </h2>
          <p className="mt-5 leading-7 text-text-secondary">
            Choose the demo you want to promote. ClipStitchr puts saved opener
            clips in front of it, keeps the text, captions, trims, and export
            settings together, and gives you finished drafts to review.
          </p>
        </div>
        <Panel className="overflow-hidden rounded-2xl p-2 shadow-[0_24px_70px_rgba(0,0,0,0.32)]">
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
