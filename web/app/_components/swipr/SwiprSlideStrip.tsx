import type { SwiprSlide } from "@/lib/clipstitchr/types/SwiprSlide";

type SwiprSlideStripProps = {
  slides: SwiprSlide[];
  activeSlideId: string | null;
  onSelectSlide: (slideId: string) => void;
};

export function SwiprSlideStrip({
  slides,
  activeSlideId,
  onSelectSlide,
}: SwiprSlideStripProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {slides.map((slide, index) => {
        const isActive = slide.id === activeSlideId;
        const text = slide.textOverlay.text.trim() || "No text";

        return (
          <button
            key={slide.id}
            type="button"
            aria-pressed={isActive}
            className={[
              "min-h-14 w-32 shrink-0 rounded-lg border bg-white p-2.5 text-left transition-colors",
              isActive
                ? "border-accent shadow-sm shadow-indigo-100"
                : "border-border hover:border-accent",
            ].join(" ")}
            onClick={() => onSelectSlide(slide.id)}
          >
            <p className="text-xs font-bold uppercase text-accent">
              Image {index + 1}
            </p>
            <p className="mt-1 line-clamp-1 text-sm font-semibold text-text-primary">
              {text}
            </p>
          </button>
        );
      })}
    </div>
  );
}
