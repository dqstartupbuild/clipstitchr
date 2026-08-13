"use client";

import { useMemo, useState } from "react";
import { PublishingStateMessage } from "@/app/_components/publishing/common/PublishingStateMessage";
import { PublishingViewHeader } from "@/app/_components/publishing/common/PublishingViewHeader";
import { PublishingComposerMedia } from "@/app/_components/publishing/compose/PublishingComposerMedia";
import { PublishingComposerResult } from "@/app/_components/publishing/compose/PublishingComposerResult";
import { PublishingDestinationEditor } from "@/app/_components/publishing/compose/PublishingDestinationEditor";
import { PublishingDestinationPicker } from "@/app/_components/publishing/compose/PublishingDestinationPicker";
import { PublishingIntentPicker } from "@/app/_components/publishing/compose/PublishingIntentPicker";
import { PublishingScheduleFields } from "@/app/_components/publishing/compose/PublishingScheduleFields";
import type { PublishingIntegration } from "@/lib/clipstitchr/publishing/client/contracts/PublishingIntegration";
import type { PublishingMediaPrefillResult } from "@/lib/clipstitchr/publishing/client/contracts/PublishingMediaPrefillResult";
import type { PublishingThumbnailPrefillResult } from "@/lib/clipstitchr/publishing/client/contracts/PublishingThumbnailPrefillResult";
import { createDefaultPublishingComposerSettings } from "@/lib/clipstitchr/publishing/client/createDefaultPublishingComposerSettings";
import { createPublishingComposerValidation } from "@/lib/clipstitchr/publishing/client/createPublishingComposerValidation";
import { getPublishingCompatibilityWarningKey } from "@/lib/clipstitchr/publishing/client/getPublishingCompatibilityWarningKey";
import { getPublishingIntegrations } from "@/lib/clipstitchr/publishing/client/requests/getPublishingIntegrations";
import { usePublishingCompatibility } from "@/lib/clipstitchr/publishing/client/usePublishingCompatibility";
import { usePublishingComposerDraft } from "@/lib/clipstitchr/publishing/client/usePublishingComposerDraft";
import { usePublishingResource } from "@/lib/clipstitchr/publishing/client/usePublishingResource";
import { useDashboardProduct } from "@/lib/clipstitchr/hooks/useDashboardProduct";
import { togglePublishingComposerDestination } from "./togglePublishingComposerDestination";
import { updatePublishingComposerDestinationSettings } from "./updatePublishingComposerDestinationSettings";
import { usePublishingComposerSubmission } from "./usePublishingComposerSubmission";

type PublishingComposerProps = {
  mediaPrefill: PublishingMediaPrefillResult;
  thumbnailPrefill: PublishingThumbnailPrefillResult;
};

export function PublishingComposer({
  mediaPrefill,
  thumbnailPrefill,
}: PublishingComposerProps) {
  const { activeProduct, activeProductId } = useDashboardProduct();
  const { draft, isRestored, reset, setDraft } = usePublishingComposerDraft(
    activeProductId ?? "unselected-product",
    mediaPrefill.descriptor,
    thumbnailPrefill.selection,
  );
  const integrationsResource = usePublishingResource(
    getPublishingIntegrations,
    activeProductId && isRestored && draft.media
      ? `composer-integrations:${activeProductId}`
      : null,
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
  const submission = usePublishingComposerSubmission({
    acknowledgedWarnings,
    activeProductId,
    compatibilityData: compatibility.data,
    compatibilityError: compatibility.error,
    draft,
    integrations,
    isRestored,
    reset,
    setAcknowledgedWarningKeys,
  });

  if (!activeProductId) {
    return (
      <section className="publishing-view" aria-labelledby="publishing-compose-title">
        <PublishingViewHeader
          description="Choose a Product before adding media, accounts, or provider settings."
          title="Create post"
          titleId="publishing-compose-title"
        />
        <PublishingStateMessage
          message="Use the dashboard Product switcher to choose where this publishing work belongs."
          title="Choose a Product first"
        />
      </section>
    );
  }

  if (submission.result) {
    return (
      <section className="publishing-view" aria-labelledby="publishing-compose-title">
        <PublishingViewHeader
          description={`These returned destination states belong to ${activeProduct?.name ?? "the active Product"}.`}
          title="Create post"
          titleId="publishing-compose-title"
        />
        <PublishingComposerResult
          intent={submission.result.intent}
          onCreateAnother={() => submission.setResult(null)}
          response={submission.result.response}
        />
      </section>
    );
  }

  if (!isRestored) {
    return (
      <section className="publishing-view" aria-labelledby="publishing-compose-title">
        <PublishingViewHeader
          description={`Start with one saved result for ${activeProduct?.name ?? "this Product"}, then choose exactly where and when it should go.`}
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
          description={`Start with one saved result for ${activeProduct?.name ?? "this Product"}, then choose exactly where and when it should go.`}
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
        description={`Start with one saved result for ${activeProduct?.name ?? "this Product"}, then choose exactly where and when it should go.`}
        title="Create post"
        titleId="publishing-compose-title"
      />
      <form className="publishing-composer" onSubmit={(event) => void submission.submit(event)}>
        <PublishingComposerMedia
          linkError={mediaPrefill.error}
          media={draft.media}
        />

        <section className="publishing-composer-section" aria-labelledby="publishing-composer-caption">
          <header>
            <h2 id="publishing-composer-caption">Caption</h2>
            <p>Instagram and TikTok use this caption. YouTube uses it as the description only when its own description is empty.</p>
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
              message="Loading your connected Instagram, TikTok, and YouTube accounts."
              title="Loading destinations"
            />
          ) : (
            <PublishingDestinationPicker
              integrations={integrations}
              onToggle={(integration) =>
                togglePublishingComposerDestination(
                  integration,
                  thumbnailPrefill.selection,
                  setDraft,
                  submission.setSubmissionError,
                )
              }
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
                        integration.provider === "youtube"
                          ? thumbnailPrefill.selection
                          : null,
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
                      updatePublishingComposerDestinationSettings(
                        integration.id,
                        nextSettings,
                        setDraft,
                      )
                    }
                    settings={settings}
                    thumbnailPrefillError={thumbnailPrefill.error}
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
          <div className="publishing-composer-submit-copy">
            {validation.formError || hasDestinationErrors || compatibility.error ? (
              <p>
                {validation.formError ||
                  Object.values(validation.destinationErrors).flat()[0] ||
                  compatibility.error}
              </p>
            ) : (
              <p>
                {draft.intent === "draft"
                  ? "Nothing will be sent to Instagram, TikTok, or YouTube."
                  : draft.intent === "schedule"
                    ? "ClipStitchr will start sending this post at the exact saved time."
                    : "This starts sending the post immediately."}
              </p>
            )}
            {submission.submissionError ? (
              <p className="publishing-inline-error" role="alert">
                {submission.submissionError}
              </p>
            ) : null}
            {submission.isSubmitting ? (
              <p className="publishing-action-status" role="status">
                Saving each destination and waiting for its real starting state.
              </p>
            ) : null}
          </div>
          <button
            className="publishing-primary-action"
            disabled={!canSubmit || submission.isSubmitting}
            type="submit"
          >
            {submission.isSubmitting
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
