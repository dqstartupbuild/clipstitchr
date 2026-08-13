import Link from "next/link";
import { PublishingPostStatus } from "@/app/_components/publishing/common/PublishingPostStatus";
import type { PublishingCreatePostResponse } from "@/lib/clipstitchr/publishing/client/contracts/PublishingCreatePostResponse";
import type { PublishingPostIntent } from "@/lib/clipstitchr/publishing/client/contracts/PublishingPostIntent";

type PublishingComposerResultProps = {
  intent: PublishingPostIntent;
  onCreateAnother: () => void;
  response: PublishingCreatePostResponse;
};

export function PublishingComposerResult({
  intent,
  onCreateAnother,
  response,
}: PublishingComposerResultProps) {
  const title =
    intent === "draft"
      ? "Draft saved"
      : intent === "schedule"
        ? "Schedule saved"
        : "Post request saved";

  return (
    <section className="publishing-composer-result" aria-live="polite">
      <h2>{title}</h2>
      <p>
        Open Posts to follow the result for each destination.
      </p>
      <ul>
        {response.destinations.map((destination) => (
          <li key={destination.integrationId}>
            <PublishingPostStatus status={destination.status} />
            {destination.message ? <span>{destination.message}</span> : null}
            <Link href={`/dashboard/studio/publishing/posts?id=${encodeURIComponent(destination.postId)}`}>
              Open result
            </Link>
          </li>
        ))}
      </ul>
      <div>
        <Link className="publishing-primary-action" href="/dashboard/studio/publishing/posts">
          View all posts
        </Link>
        <button className="publishing-text-action" type="button" onClick={onCreateAnother}>
          Create another post
        </button>
      </div>
    </section>
  );
}
