import type { InstagramComposerSettings } from "@/lib/clipstitchr/publishing/client/contracts/InstagramComposerSettings";

type PublishingInstagramSettingsProps = {
  onChange: (settings: InstagramComposerSettings) => void;
  settings: InstagramComposerSettings;
};

export function PublishingInstagramSettings({
  onChange,
  settings,
}: PublishingInstagramSettingsProps) {
  return (
    <div className="publishing-provider-settings">
      <label>
        Instagram placement
        <select
          value={settings.placement}
          onChange={(event) =>
            onChange({
              placement: event.target.value as "feed" | "story",
              provider: "instagram",
            })
          }
        >
          <option value="feed">Feed or Reel</option>
          <option value="story">Story</option>
        </select>
      </label>
      <p>
        ClipStitchr will use the saved media shape to choose the supported feed format. Story captions may not appear on Instagram.
      </p>
    </div>
  );
}
