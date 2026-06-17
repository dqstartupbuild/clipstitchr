import { Copy, Trash2 } from "lucide-react";
import { IconButton } from "@/app/_components/ui/IconButton";
import type { SwiprSlide } from "@/lib/clipstitchr/types/SwiprSlide";

type SwiprSlideStripProps = {
  canCopyActivePhotoToAllSlides?: boolean;
  slides: SwiprSlide[];
  activeSlideId: string | null;
  onCopyActivePhotoToAllSlides?: () => void;
  onRemoveSlide?: (slideId: string) => void;
  onSelectSlide: (slideId: string) => void;
};

export function SwiprSlideStrip({
  canCopyActivePhotoToAllSlides = false,
  slides,
  activeSlideId,
  onCopyActivePhotoToAllSlides,
  onRemoveSlide,
  onSelectSlide,
}: SwiprSlideStripProps) {
  return (
    <div className="grid gap-2">
      {onCopyActivePhotoToAllSlides ? (
        <div className="flex justify-end">
          <button
            type="button"
            className="inline-flex h-8 items-center justify-center gap-2 rounded-lg border border-border bg-white px-3 text-xs font-semibold text-text-secondary transition-colors hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-60"
            disabled={!canCopyActivePhotoToAllSlides}
            onClick={onCopyActivePhotoToAllSlides}
          >
            <Copy aria-hidden className="h-3.5 w-3.5" />
            Copy photo to all
          </button>
        </div>
      ) : null}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {slides.map((slide, index) => {
          const isActive = slide.id === activeSlideId;
          const text = slide.textOverlay.text.trim() || "No text";

          return (
            <div key={slide.id} className="relative w-28 shrink-0">
              <button
                type="button"
                aria-pressed={isActive}
                className={[
                  "min-h-12 w-full rounded-lg border bg-white p-2 pr-9 text-left transition-colors",
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
              {onRemoveSlide ? (
                <IconButton
                  type="button"
                  label={`Remove image ${index + 1}`}
                  variant="danger"
                  className="absolute right-1 top-1 h-7 w-7"
                  icon={<Trash2 aria-hidden className="h-3.5 w-3.5" />}
                  disabled={slides.length <= 1}
                  onClick={() => onRemoveSlide(slide.id)}
                />
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
