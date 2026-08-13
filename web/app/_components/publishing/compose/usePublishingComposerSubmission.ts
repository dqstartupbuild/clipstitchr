"use client";

import type { Dispatch, FormEvent, SetStateAction } from "react";
import { useRef, useState } from "react";
import type { PublishingCompatibilityResponse } from "@/lib/clipstitchr/publishing/client/contracts/PublishingCompatibilityResponse";
import type { PublishingComposerDraft } from "@/lib/clipstitchr/publishing/client/contracts/PublishingComposerDraft";
import type { PublishingCreatePostResponse } from "@/lib/clipstitchr/publishing/client/contracts/PublishingCreatePostResponse";
import type { PublishingIntegration } from "@/lib/clipstitchr/publishing/client/contracts/PublishingIntegration";
import type { PublishingMediaDescriptor } from "@/lib/clipstitchr/publishing/client/contracts/PublishingMediaDescriptor";
import type { PublishingPostIntent } from "@/lib/clipstitchr/publishing/client/contracts/PublishingPostIntent";
import { createPublishingComposerValidation } from "@/lib/clipstitchr/publishing/client/createPublishingComposerValidation";
import { createPublishingPostRequestFromDraft } from "@/lib/clipstitchr/publishing/client/createPublishingPostRequestFromDraft";
import { createPublishingPost } from "@/lib/clipstitchr/publishing/client/requests/createPublishingPost";

export function usePublishingComposerSubmission(options: {
  acknowledgedWarnings: ReadonlySet<string>;
  activeProductId: string | null | undefined;
  compatibilityData: PublishingCompatibilityResponse | null;
  compatibilityError: string | null;
  draft: PublishingComposerDraft;
  integrations: PublishingIntegration[];
  isRestored: boolean;
  reset: (media?: PublishingMediaDescriptor | null) => void;
  setAcknowledgedWarningKeys: Dispatch<SetStateAction<Set<string>>>;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submissionInFlight = useRef(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    intent: PublishingPostIntent;
    response: PublishingCreatePostResponse;
  } | null>(null);

  return {
    isSubmitting,
    result,
    setResult,
    setSubmissionError,
    submissionError,
    submit: async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (submissionInFlight.current) {
        return;
      }

      const validation = createPublishingComposerValidation({
        acknowledgedWarnings: options.acknowledgedWarnings,
        compatibility: options.compatibilityData,
        draft: options.draft,
        integrations: options.integrations,
        isRestored: options.isRestored,
      });
      const destinationError = Object.values(
        validation.destinationErrors,
      ).flat()[0];
      if (validation.formError || destinationError || options.compatibilityError) {
        setSubmissionError(
          validation.formError ||
            destinationError ||
            options.compatibilityError ||
            "Review the post before continuing.",
        );
        return;
      }

      submissionInFlight.current = true;
      setIsSubmitting(true);
      setSubmissionError(null);
      try {
        const response = await createPublishingPost(
          createPublishingPostRequestFromDraft({
            draft: options.draft,
            integrations: options.integrations,
            mediaRevision: options.compatibilityData?.mediaRevision ?? "",
          }),
          options.activeProductId ?? "",
        );
        const submittedIntent = options.draft.intent;
        options.reset(options.draft.media);
        options.setAcknowledgedWarningKeys(new Set());
        setResult({ intent: submittedIntent, response });
      } catch (error) {
        setSubmissionError(
          error instanceof Error
            ? error.message
            : "ClipStitchr could not save this post.",
        );
      } finally {
        submissionInFlight.current = false;
        setIsSubmitting(false);
      }
    },
  } as const;
}
