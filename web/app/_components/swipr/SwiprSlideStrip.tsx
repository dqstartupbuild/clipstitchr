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
    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
      {slides.map((slide, index) => {
        const isActive = slide.id === activeSlideId;
        const text = slide.textOverlay.text.trim() || "No text";

        return (
          <button
            key={slide.id}
            type="button"
            aria-pressed={isActive}
            className={[
              "min-h-20 rounded-lg border bg-white p-3 text-left transition-colors",
              isActive
                ? "border-accent shadow-sm shadow-indigo-100"
                : "border-border hover:border-accent",
            ].join(" ")}
            onClick={() => onSelectSlide(slide.id)}
          >
            <p className="text-xs font-bold uppercase text-accent">
              Image {index + 1}
            </p>
            <p className="mt-2 line-clamp-2 text-sm font-semibold text-text-primary">
              {text}
            </p>
          </button>
        );
      })}
    </div>
  );
}
