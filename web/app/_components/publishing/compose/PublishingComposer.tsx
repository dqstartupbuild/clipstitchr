"use client";

import type { FormEvent } from "react";
import { useMemo, useRef, useState } from "react";
import { PublishingStateMessage } from "@/app/_components/publishing/common/PublishingStateMessage";
import { PublishingViewHeader } from "@/app/_components/publishing/common/PublishingViewHeader";
import { PublishingComposerMedia } from "@/app/_components/publishing/compose/PublishingComposerMedia";
import { PublishingComposerResult } from "@/app/_components/publishing/compose/PublishingComposerResult";
import { PublishingDestinationEditor } from "@/app/_components/publishing/compose/PublishingDestinationEditor";
import { PublishingDestinationPicker } from "@/app/_components/publishing/compose/PublishingDestinationPicker";
import { PublishingIntentPicker } from "@/app/_components/publishing/compose/PublishingIntentPicker";
import { PublishingScheduleFields } from "@/app/_components/publishing/compose/PublishingScheduleFields";
import type { PublishingComposerSettings } from "@/lib/clipstitchr/publishing/client/contracts/PublishingComposerSettings";
import type { PublishingCreatePostResponse } from "@/lib/clipstitchr/publishing/client/contracts/PublishingCreatePostResponse";
import type { PublishingIntegration } from "@/lib/clipstitchr/publishing/client/contracts/PublishingIntegration";
import type { PublishingMediaPrefillResult } from "@/lib/clipstitchr/publishing/client/contracts/PublishingMediaPrefillResult";
import type { PublishingPostIntent } from "@/lib/clipstitchr/publishing/client/contracts/PublishingPostIntent";
import { createDefaultPublishingComposerSettings } from "@/lib/clipstitchr/publishing/client/createDefaultPublishingComposerSettings";
import { createPublishingComposerValidation } from "@/lib/clipstitchr/publishing/client/createPublishingComposerValidation";
import { createPublishingPostRequestFromDraft } from "@/lib/clipstitchr/publishing/client/createPublishingPostRequestFromDraft";
import { getPublishingCompatibilityWarningKey } from "@/lib/clipstitchr/publishing/client/getPublishingCompatibilityWarningKey";
import { createPublishingPost } from "@/lib/clipstitchr/publishing/client/requests/createPublishingPost";
import { getPublishingIntegrations } from "@/lib/clipstitchr/publishing/client/requests/getPublishingIntegrations";
import { usePublishingCompatibility } from "@/lib/clipstitchr/publishing/client/usePublishingCompatibility";
import { usePublishingComposerDraft } from "@/lib/clipstitchr/publishing/client/usePublishingComposerDraft";
import { usePublishingResource } from "@/lib/clipstitchr/publishing/client/usePublishingResource";

type PublishingComposerProps = {
  mediaPrefill: PublishingMediaPrefillResult;
};

export function PublishingComposer({ mediaPrefill }: PublishingComposerProps) {
  const { draft, isRestored, reset, setDraft } = usePublishingComposerDraft(
    mediaPrefill.descriptor,
  );
  const integrationsResource = usePublishingResource(
    getPublishingIntegrations,
    isRestored && draft.media ? "composer-integrations" : null,
  );
  const integrations = useMemo(
    () =>
      integrationsResource.data?.providers.flatMap(
        (group) => group.integrations,
      ) ?? [],
    [integrationsResource.data],
  );
  const selectedIntegrations = useMemo(
    () =>
      draft.destinationIds
        .map((id) => integrations.find((integration) => integration.id === id))
        .filter((item): item is PublishingIntegration => Boolean(item)),
    [draft.destinationIds, integrations],
  );
  const compatibility = usePublishingCompatibility(
    draft.media,
    selectedIntegrations,
  );
  const [acknowledgedWarningKeys, setAcknowledgedWarningKeys] = useState<
    Set<string>
  >(() => new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submissionInFlight = useRef(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    intent: PublishingPostIntent;
    response: PublishingCreatePostResponse;
  } | null>(null);
  const acknowledgedWarnings = useMemo(
    () =>
      new Set(
        selectedIntegrations
          .filter((integration) => {
            const warningKey = getPublishingCompatibilityWarningKey(
              compatibility.data,
              integration.id,
            );
            return warningKey
              ? acknowledgedWarningKeys.has(warningKey)
              : false;
          })
          .map((integration) => integration.id),
      ),
    [acknowledgedWarningKeys, compatibility.data, selectedIntegrations],
  );

  const validation = createPublishingComposerValidation({
    acknowledgedWarnings,
    compatibility: compatibility.data,
    draft,
    integrations,
    isRestored,
  });
  const hasDestinationErrors = Object.values(validation.destinationErrors).some(
    (errors) => errors.length > 0,
  );
  const canSubmit =
    !validation.formError &&
    !hasDestinationErrors &&
    !compatibility.error &&
    !compatibility.isLoading &&
    !integrationsResource.error &&
    !integrationsResource.isLoading;

  const toggleDestination = (integration: PublishingIntegration) => {
    setSubmissionError(null);
    setDraft((current) => {
      const selected = current.destinationIds.includes(integration.id);
      return {
        ...current,
        destinationIds: selected
          ? current.destinationIds.filter((id) => id !== integration.id)
          : [...current.destinationIds, integration.id],
        settingsByIntegrationId: {
          ...current.settingsByIntegrationId,
          ...(selected || current.settingsByIntegrationId[integration.id]
            ? {}
            : {
                [integration.id]:
                  createDefaultPublishingComposerSettings(integration.provider),
              }),
        },
      };
    });
  };

  const updateDestinationSettings = (
    integrationId: string,
    settings: PublishingComposerSettings,
  ) => {
    setDraft((current) => ({
      ...current,
      settingsByIntegrationId: {
        ...current.settingsByIntegrationId,
        [integrationId]: settings,
      },
    }));
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submissionInFlight.current) {
      return;
    }
    const currentValidation = createPublishingComposerValidation({
      acknowledgedWarnings,
      compatibility: compatibility.data,
      draft,
      integrations,
      isRestored,
    });
    const destinationError = Object.values(
      currentValidation.destinationErrors,
    ).flat()[0];
    if (currentValidation.formError || destinationError || compatibility.error) {
      setSubmissionError(
        currentValidation.formError ||
          destinationError ||
          compatibility.error ||
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
          draft,
          integrations,
          mediaRevision: compatibility.data?.mediaRevision ?? "",
        }),
      );
      const submittedIntent = draft.intent;
      reset(draft.media);
      setAcknowledgedWarningKeys(new Set());
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
  };

  if (result) {
    return (
      <section className="publishing-view" aria-labelledby="publishing-compose-title">
        <PublishingViewHeader
          description="Your returned destination states are saved below."
          title="Create post"
          titleId="publishing-compose-title"
        />
        <PublishingComposerResult
          intent={result.intent}
          onCreateAnother={() => setResult(null)}
          response={result.response}
        />
      </section>
    );
  }

  if (!isRestored) {
    return (
      <section className="publishing-view" aria-labelledby="publishing-compose-title">
        <PublishingViewHeader
          description="Start with one saved ClipStitchr result, then choose exactly where and when it should go."
          title="Create post"
          titleId="publishing-compose-title"
        />
        <PublishingStateMessage
          message="Restoring the saved media and unfinished choices from this browser session."
          title="Opening composer"
        />
      </section>
    );
  }

  if (!draft.media) {
    return (
      <section className="publishing-view" aria-labelledby="publishing-compose-title">
        <PublishingViewHeader
          description="Start with one saved ClipStitchr result, then choose exactly where and when it should go."
          title="Create post"
          titleId="publishing-compose-title"
        />
        <div className="publishing-composer">
          <PublishingComposerMedia linkError={mediaPrefill.error} media={null} />
        </div>
      </section>
    );
  }

  return (
    <section className="publishing-view" aria-labelledby="publishing-compose-title">
      <PublishingViewHeader
        description="Start with one saved ClipStitchr result, then choose exactly where and when it should go."
        title="Create post"
        titleId="publishing-compose-title"
      />
      <form className="publishing-composer" onSubmit={(event) => void submit(event)}>
        <PublishingComposerMedia
          linkError={mediaPrefill.error}
          media={draft.media}
        />

        <section className="publishing-composer-section" aria-labelledby="publishing-composer-caption">
          <header>
            <h2 id="publishing-composer-caption">Caption</h2>
            <p>One caption is sent to every selected destination.</p>
          </header>
          <label className="publishing-caption-field">
            Caption text
            <textarea
              maxLength={2_000}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  caption: event.target.value,
                }))
              }
              rows={7}
              value={draft.caption}
            />
            <span>{draft.caption.length} / 2,000</span>
          </label>
        </section>

        <section className="publishing-composer-section" aria-labelledby="publishing-composer-destinations">
          <header>
            <h2 id="publishing-composer-destinations">Choose destinations</h2>
            <p>Each account keeps its own settings and result.</p>
          </header>
          {integrationsResource.error ? (
            <PublishingStateMessage
              action={
                <button className="publishing-text-action" type="button" onClick={integrationsResource.reload}>
                  Try again
                </button>
              }
              message={integrationsResource.error}
              title="Connections could not load"
              tone="error"
            />
          ) : integrationsResource.isLoading || !integrationsResource.data ? (
            <PublishingStateMessage
              message="Loading your connected Instagram and TikTok accounts."
              title="Loading destinations"
            />
          ) : (
            <PublishingDestinationPicker
              integrations={integrations}
              onToggle={toggleDestination}
              selectedIds={draft.destinationIds}
            />
          )}
        </section>

        {selectedIntegrations.length ? (
          <section className="publishing-composer-section" aria-labelledby="publishing-composer-settings">
            <header>
              <h2 id="publishing-composer-settings">Destination settings</h2>
              <p>Review every destination. TikTok inbox delivery still needs you to publish inside TikTok.</p>
            </header>
            {compatibility.error ? (
              <p className="publishing-inline-error" role="alert">
                {compatibility.error}{" "}
                <button type="button" onClick={compatibility.reload}>
                  Check again
                </button>
              </p>
            ) : null}
            <div className="publishing-destination-editors">
              {selectedIntegrations.map((integration) => {
                const storedSettings =
                  draft.settingsByIntegrationId[integration.id];
                const settings =
                  storedSettings?.provider === integration.provider
                    ? storedSettings
                    : createDefaultPublishingComposerSettings(
                        integration.provider,
                      );
                const warningKey = getPublishingCompatibilityWarningKey(
                  compatibility.data,
                  integration.id,
                );
                return (
                  <PublishingDestinationEditor
                    compatibility={
                      compatibility.data?.destinations.find(
                        (item) => item.integrationId === integration.id,
                      ) ?? null
                    }
                    errors={validation.destinationErrors[integration.id] ?? []}
                    integration={integration}
                    isCheckingCompatibility={compatibility.isLoading}
                    key={integration.id}
                    onAcknowledgeWarning={(checked) =>
                      setAcknowledgedWarningKeys((current) => {
                        const next = new Set(current);
                        if (warningKey) {
                          if (checked) {
                            next.add(warningKey);
                          } else {
                            next.delete(warningKey);
                          }
                        }
                        return next;
                      })
                    }
                    onSettingsChange={(nextSettings) =>
                      updateDestinationSettings(integration.id, nextSettings)
                    }
                    settings={settings}
                    warningAcknowledged={
                      warningKey
                        ? acknowledgedWarningKeys.has(warningKey)
                        : false
                    }
                  />
                );
              })}
            </div>
          </section>
        ) : null}

        <section className="publishing-composer-section" aria-labelledby="publishing-composer-timing">
          <header>
            <h2 id="publishing-composer-timing">Save or send</h2>
            <p>The final button performs only the option selected here.</p>
          </header>
          <PublishingIntentPicker
            onChange={(intent) =>
              setDraft((current) => ({ ...current, intent }))
            }
            value={draft.intent}
          />
          {draft.intent === "schedule" ? (
            <PublishingScheduleFields
              localDateTime={draft.localDateTime}
              onLocalDateTimeChange={(localDateTime) =>
                setDraft((current) => ({
                  ...current,
                  localDateTime,
                  utcOffsetMinutes: null,
                }))
              }
              onTimeZoneChange={(timeZone) =>
                setDraft((current) => ({
                  ...current,
                  timeZone,
                  utcOffsetMinutes: null,
                }))
              }
              onUtcOffsetChange={(utcOffsetMinutes) =>
                setDraft((current) => ({ ...current, utcOffsetMinutes }))
              }
              timeZone={draft.timeZone}
              utcOffsetMinutes={draft.utcOffsetMinutes}
            />
          ) : null}
        </section>

        <div className="publishing-composer-submit">
          {validation.formError || hasDestinationErrors || compatibility.error ? (
            <p>
              {validation.formError ||
                Object.values(validation.destinationErrors).flat()[0] ||
                compatibility.error}
            </p>
          ) : (
            <p>
              {draft.intent === "draft"
                ? "Nothing will be sent to Instagram or TikTok."
                : draft.intent === "schedule"
                  ? "ClipStitchr will start provider work at the exact saved time."
                  : "This starts real provider work immediately."}
            </p>
          )}
          {submissionError ? (
            <p className="publishing-inline-error" role="alert">
              {submissionError}
            </p>
          ) : null}
          <button
            className="publishing-primary-action"
            disabled={!canSubmit || isSubmitting}
            type="submit"
          >
            {isSubmitting
              ? "Saving…"
              : draft.intent === "draft"
                ? "Save draft"
                : draft.intent === "schedule"
                  ? "Schedule post"
                  : "Publish now"}
          </button>
        </div>
      </form>
    </section>
  );
}
