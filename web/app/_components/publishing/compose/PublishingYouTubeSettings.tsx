import { PublishingMediaReference } from "@/app/_components/publishing/common/PublishingMediaReference";
import type { YouTubeComposerSettings } from "@/lib/clipstitchr/publishing/client/contracts/YouTubeComposerSettings";
import { countPublishingYouTubeTagCharacters } from "@/lib/clipstitchr/publishing/client/countPublishingYouTubeTagCharacters";
import { normalizePublishingYouTubeTags } from "@/lib/clipstitchr/publishing/client/normalizePublishingYouTubeTags";

type PublishingYouTubeSettingsProps = {
  integrationId: string;
  onChange: (settings: YouTubeComposerSettings) => void;
  prefillError: string | null;
  settings: YouTubeComposerSettings;
};

export function PublishingYouTubeSettings({
  integrationId,
  onChange,
  prefillError,
  settings,
}: PublishingYouTubeSettingsProps) {
  const normalizedTags = normalizePublishingYouTubeTags(settings.tags);
  const tagCharacters = countPublishingYouTubeTagCharacters(normalizedTags);

  return (
    <div className="publishing-provider-settings publishing-youtube-settings">
      <p className="publishing-youtube-fallback-note">
        YouTube always uses the title below. If you leave the description empty, the shared caption becomes the YouTube description. The title never falls back to the caption.
      </p>
      <label>
        YouTube title
        <input
          maxLength={100}
          minLength={2}
          onChange={(event) =>
            onChange({ ...settings, title: event.target.value })
          }
          required
          value={settings.title}
        />
        <span>{settings.title.trim().length} / 100</span>
      </label>
      <label>
        YouTube description <span className="publishing-optional-copy">Optional override</span>
        <textarea
          maxLength={5_000}
          onChange={(event) =>
            onChange({ ...settings, description: event.target.value })
          }
          rows={5}
          value={settings.description}
        />
        <span>{settings.description.length} / 5,000</span>
      </label>
      <label>
        Visibility
        <select
          onChange={(event) =>
            onChange({
              ...settings,
              visibility: event.target.value as YouTubeComposerSettings["visibility"],
            })
          }
          value={settings.visibility}
        >
          <option value="private">Private</option>
          <option value="unlisted">Unlisted</option>
          <option value="public">Public</option>
        </select>
      </label>
      <fieldset className="publishing-youtube-audience">
        <legend>Is this video made for kids?</legend>
        <p>Choose the audience yourself. ClipStitchr will not guess.</p>
        <label>
          <input
            checked={settings.madeForKids === true}
            name={`publishing-youtube-made-for-kids-${integrationId}`}
            onChange={() => onChange({ ...settings, madeForKids: true })}
            type="radio"
          />
          Yes, it is made for kids
        </label>
        <label>
          <input
            checked={settings.madeForKids === false}
            name={`publishing-youtube-made-for-kids-${integrationId}`}
            onChange={() => onChange({ ...settings, madeForKids: false })}
            type="radio"
          />
          No, it is not made for kids
        </label>
      </fieldset>
      <label>
        Tags <span className="publishing-optional-copy">Optional, one per line</span>
        <textarea
          aria-describedby="publishing-youtube-tag-help"
          maxLength={700}
          onChange={(event) =>
            onChange({ ...settings, tags: event.target.value.split(/\r?\n/u) })
          }
          rows={4}
          value={settings.tags.join("\n")}
        />
        <span id="publishing-youtube-tag-help">
          {tagCharacters} / 500 YouTube characters. A tag with spaces uses 2 extra characters.
        </span>
      </label>
      <section className="publishing-youtube-thumbnail" aria-labelledby="publishing-youtube-thumbnail-title">
        <h3 id="publishing-youtube-thumbnail-title">Custom thumbnail</h3>
        {prefillError ? (
          <p className="publishing-inline-warning">{prefillError}</p>
        ) : null}
        {settings.thumbnail ? (
          <>
            <PublishingMediaReference media={settings.thumbnail.media} />
            <p>
              ClipStitchr will recheck that this is one owned JPEG or PNG for the active Product and no larger than 2 MB.
            </p>
            <button
              className="publishing-text-action"
              onClick={() => onChange({ ...settings, thumbnail: null })}
              type="button"
            >
              Remove custom thumbnail
            </button>
          </>
        ) : (
          <p>
            No custom thumbnail is selected. YouTube can choose a frame from the video.
          </p>
        )}
      </section>
    </div>
  );
}
