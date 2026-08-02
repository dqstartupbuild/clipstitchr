import type { PublishingPostIntent } from "@/lib/clipstitchr/publishing/client/contracts/PublishingPostIntent";

type PublishingIntentPickerProps = {
  onChange: (intent: PublishingPostIntent) => void;
  value: PublishingPostIntent;
};

export function PublishingIntentPicker({
  onChange,
  value,
}: PublishingIntentPickerProps) {
  return (
    <fieldset className="publishing-intent-picker">
      <legend>What should happen?</legend>
      <label>
        <input
          checked={value === "draft"}
          name="publishing-intent"
          onChange={() => onChange("draft")}
          type="radio"
        />
        <span>
          <strong>Save draft</strong>
          <small>Keep it in ClipStitchr. Nothing is sent to a provider.</small>
        </span>
      </label>
      <label>
        <input
          checked={value === "publish-now"}
          name="publishing-intent"
          onChange={() => onChange("publish-now")}
          type="radio"
        />
        <span>
          <strong>Publish now</strong>
          <small>Start provider work as soon as you confirm the post.</small>
        </span>
      </label>
      <label>
        <input
          checked={value === "schedule"}
          name="publishing-intent"
          onChange={() => onChange("schedule")}
          type="radio"
        />
        <span>
          <strong>Schedule</strong>
          <small>Use an exact local date, time zone, and UTC offset.</small>
        </span>
      </label>
    </fieldset>
  );
}
