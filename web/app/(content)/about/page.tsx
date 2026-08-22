import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

export const metadata: Metadata = createPageMetadata({
  title: `About | ${site.name}`,
  description: "Learn what ClipStitchr is built for and how its app-video workflow works.",
  canonical: "/about",
});

export default function AboutPage() {
  return (
    <article className="legal-page">
      <div className="legal-document">
        <header className="legal-header">
          <p>About ClipStitchr</p>
          <h1 className="marketing-heading">
            Make more app ads from the footage you have.
          </h1>
        </header>
        <div className="prose-legal">
        <section>
          <h2>What we make</h2>
          <p>ClipStitchr helps indie app builders and mobile marketers turn UGC clips and product demos into short, clear ads for TikTok, Instagram Reels, and YouTube Shorts. It is for teams that need to keep shipping the product while still showing people why that product matters. Instead of starting every idea in a video editor, you can keep a working library of clips, demos, swaps, swipes, stitches, and avatars, then use the right workspace for the job in front of you.</p>
          <p>Stitchr pairs a selected UGC clip with one product demo, applies one shared text overlay across the batch, and produces a separate finished stitch for each UGC choice. Clipr helps shape a focused demo. Swipr helps make visual carousel material. Swapr and avatar tools support the surrounding creative work. Hook Lab looks at public TikTok and Instagram posts you choose so you can understand a format before adapting the lesson to your own product.</p>
        </section>
        <section>
          <h2>How media is handled</h2>
          <p>Normalizing uploads, previews, stitching, and some preparation work happen in the browser where browser support allows it. Saved media is stored in Cloudflare R2 and the information that helps organize it, such as names, tags, trim ranges, and object references, is stored in Convex. Your browser can also keep preview images locally so the library feels faster. You stay in control of the clips and photos in your account and can remove saved work from the dashboard.</p>
          <p>ClipStitchr is not a promise of ad performance or a substitute for audience research. It is a production workspace for turning a real product story into more usable creative, with room to test, learn, and make the next version better.</p>
        </section>
        </div>
      </div>
    </article>
  );
}
