"use client";

import { useRef, useState } from "react";
import { PublishingMediaReference } from "@/app/_components/publishing/common/PublishingMediaReference";
import { PublishingPostStatus } from "@/app/_components/publishing/common/PublishingPostStatus";
import { PublishingProviderMark } from "@/app/_components/publishing/common/PublishingProviderMark";
import { PublishingStateMessage } from "@/app/_components/publishing/common/PublishingStateMessage";
import { PublishingPostActionConfirmation } from "@/app/_components/publishing/posts/PublishingPostActionConfirmation";
import type { PublishingPostDetail as PublishingPostDetailValue } from "@/lib/clipstitchr/publishing/client/contracts/PublishingPostDetail";
import { formatPublishingPostAttemptStatus } from "@/lib/clipstitchr/publishing/client/formatPublishingPostAttemptStatus";
import { cancelPublishingPost } from "@/lib/clipstitchr/publishing/client/requests/cancelPublishingPost";
import { getPublishingPost } from "@/lib/clipstitchr/publishing/client/requests/getPublishingPost";
import { retryPublishingPost } from "@/lib/clipstitchr/publishing/client/requests/retryPublishingPost";
import { usePublishingResource } from "@/lib/clipstitchr/publishing/client/usePublishingResource";

type PublishingPostDetailProps = {
  id: string;
};

export function PublishingPostDetail({ id }: PublishingPostDetailProps) {
  const resource = usePublishingResource(
    (signal) => getPublishingPost(id, signal),
    id,
  );
  const [postOverride, setPostOverride] =
    useState<PublishingPostDetailValue | null>(null);
  const [confirmation, setConfirmation] = useState<"cancel" | "retry" | null>(
    null,
  );
  const [actionError, setActionError] = useState<string | null>(null);
  const [isActing, setIsActing] = useState(false);
  const actionInFlight = useRef(false);
  const post = postOverride ?? resource.data?.post ?? null;

  const runAction = async () => {
    if (!confirmation || actionInFlight.current) {
      return;
    }
    actionInFlight.current = true;
    setIsActing(true);
    setActionError(null);
    try {
      const result =
        confirmation === "retry"
          ? await retryPublishingPost(id)
          : await cancelPublishingPost(id);
      setPostOverride(result.post);
      setConfirmation(null);
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "That action did not finish.",
      );
    } finally {
      actionInFlight.current = false;
      setIsActing(false);
    }
  };

  if (resource.error) {
    return (
      <PublishingStateMessage
        action={
          <button className="publishing-text-action" type="button" onClick={resource.reload}>
            Try again
          </button>
        }
        message={resource.error}
        title="Post details could not load"
        tone="error"
      />
    );
  }

  if (!post) {
    return (
      <PublishingStateMessage
        message="Loading the saved provider result and attempt history."
        title="Loading post"
      />
    );
  }

  return (
    <aside className="publishing-post-detail" aria-label="Post details">
      <header>
        <span className="publishing-post-detail-account">
          <PublishingProviderMark provider={post.provider} size={24} />
          <strong>{post.accountName}</strong>
        </span>
        <PublishingPostStatus status={post.status} />
      </header>
      <p className="publishing-post-detail-caption">{post.caption || "No caption"}</p>
      <PublishingMediaReference media={post.media} />
      {post.statusMessage ? (
        <p className="publishing-post-detail-message">{post.statusMessage}</p>
      ) : null}
      {post.resultUrl ? (
        <a
          aria-label="View provider result in a new tab"
          href={post.resultUrl}
          rel="noreferrer"
          target="_blank"
        >
          View provider result
        </a>
      ) : null}

      <div className="publishing-post-detail-actions">
        {post.canRetry ? (
          <button type="button" onClick={() => setConfirmation("retry")}>
            Retry failed destination
          </button>
        ) : null}
        {post.canCancel ? (
          <button type="button" onClick={() => setConfirmation("cancel")}>
            Cancel scheduled post
          </button>
        ) : null}
      </div>
      {confirmation ? (
        <PublishingPostActionConfirmation
          actionLabel={
            confirmation === "retry" ? "Retry this destination" : "Cancel schedule"
          }
          busy={isActing}
          explanation={
            confirmation === "retry"
              ? "This can contact the provider again. A destination with a saved success receipt will not be posted twice."
              : "This stops future work only when the service can still prove it is safe to cancel."
          }
          onCancel={() => setConfirmation(null)}
          onConfirm={() => void runAction()}
          tone={confirmation === "cancel" ? "danger" : "neutral"}
        />
      ) : null}
      {actionError ? (
        <p className="publishing-inline-error" role="alert">
          {actionError}
        </p>
      ) : null}

      <details className="publishing-post-attempts">
        <summary>Attempt history ({post.attempts.length})</summary>
        {post.attempts.length ? (
          <ol>
            {post.attempts.map((attempt) => (
              <li key={attempt.id}>
                <strong>Attempt {attempt.number}</strong>
                <span>{formatPublishingPostAttemptStatus(attempt.status)}</span>
                {attempt.message ? <p>{attempt.message}</p> : null}
              </li>
            ))}
          </ol>
        ) : (
          <p>No provider attempt has started.</p>
        )}
      </details>
    </aside>
  );
}
