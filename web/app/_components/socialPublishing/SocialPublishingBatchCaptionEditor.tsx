type SocialPublishingBatchCaptionEditorProps = {
  activeIndex: number;
  captions: string[];
  disabled: boolean;
  titles: string[];
  onActiveIndexChange: (index: number) => void;
  onCaptionChange: (index: number, caption: string) => void;
};

export function SocialPublishingBatchCaptionEditor({
  activeIndex,
  captions,
  disabled,
  titles,
  onActiveIndexChange,
  onCaptionChange,
}: SocialPublishingBatchCaptionEditorProps) {
  return (
    <div className="grid gap-3">
      <label className="block">
        <span className="text-sm font-bold text-text-primary">Caption</span>
        <select
          className="mt-2 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm font-semibold text-text-primary outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/15"
          value={activeIndex}
          disabled={disabled}
          onChange={(event) => onActiveIndexChange(Number(event.target.value))}
        >
          {titles.map((title, index) => (
            <option key={`${index}-${title}`} value={index}>
              {index + 1}. {title}
            </option>
          ))}
        </select>
      </label>
      <textarea
        aria-label={`Caption ${activeIndex + 1}`}
        className="min-h-32 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm leading-6 text-text-primary outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/15"
        value={captions[activeIndex] ?? ""}
        disabled={disabled}
        onChange={(event) => onCaptionChange(activeIndex, event.target.value)}
      />
      <p className="text-sm font-semibold text-text-secondary">
        Each draft keeps its own caption. Pick a number to review or edit it.
      </p>
    </div>
  );
}
