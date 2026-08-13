import Link from "next/link";
import { PublishingMediaReference } from "@/app/_components/publishing/common/PublishingMediaReference";
import type { PublishingMediaDescriptor } from "@/lib/clipstitchr/publishing/client/contracts/PublishingMediaDescriptor";

type PublishingComposerMediaProps = {
  linkError: string | null;
  media: PublishingMediaDescriptor | null;
};

export function PublishingComposerMedia({
  linkError,
  media,
}: PublishingComposerMediaProps) {
  return (
    <section className="publishing-composer-section" aria-labelledby="publishing-composer-media">
      <header>
        <h2 id="publishing-composer-media">Saved media</h2>
        <p>Choose media already saved to this Product.</p>
      </header>
      {linkError ? <p className="publishing-inline-warning">{linkError}</p> : null}
      {media ? (
        <PublishingMediaReference media={media} />
      ) : (
        <div className="publishing-composer-missing-media">
          <p>
            Use Publish from a saved Stitch, Swipe, or supported Library item.
          </p>
          <Link href="/dashboard/library">Open Library</Link>
        </div>
      )}
    </section>
  );
}
