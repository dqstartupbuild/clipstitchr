import { Play } from "lucide-react";

type VideoPreviewProps = {
  src: string | null;
  posterSrc?: string | null;
  label: string;
  controls?: boolean;
  muted?: boolean;
  isLoading?: boolean;
  onLoadPreview?: () => void;
};

export function VideoPreview({
  src,
  posterSrc,
  label,
  controls = true,
  muted = true,
  isLoading = false,
  onLoadPreview,
}: VideoPreviewProps) {
  return (
    <div className="aspect-[9/16] overflow-hidden rounded-lg bg-slate-950">
      {src ? (
        <video
          key={`${src}:${posterSrc ?? "no-poster"}`}
          aria-label={label}
          className="h-full w-full object-contain"
          controls={controls}
          muted={muted}
          playsInline
          poster={posterSrc ?? undefined}
          preload="metadata"
          src={src}
        />
      ) : posterSrc ? (
        onLoadPreview ? (
          <button
            type="button"
            aria-label={`Preview ${label}`}
            className="group relative h-full w-full bg-cover bg-center"
            style={{ backgroundImage: `url(${posterSrc})` }}
            disabled={isLoading}
            onClick={onLoadPreview}
          >
            <span className="absolute inset-0 bg-slate-950/20 transition-colors group-hover:bg-slate-950/30" />
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/95 text-accent shadow-lg">
                <Play aria-hidden className="ml-0.5 h-5 w-5 fill-current" />
              </span>
            </span>
          </button>
        ) : (
          <div
            aria-label={label}
            role="img"
            className="h-full w-full bg-cover bg-center"
            style={{ backgroundImage: `url(${posterSrc})` }}
          />
        )
      ) : onLoadPreview ? (
        <button
          type="button"
          aria-label={`Preview ${label}`}
          className="flex h-full w-full items-center justify-center px-4 text-center text-sm font-semibold text-slate-300 transition-colors hover:bg-slate-900"
          disabled={isLoading}
          onClick={onLoadPreview}
        >
          {isLoading ? "Loading preview" : "Preview"}
        </button>
      ) : (
        <div className="flex h-full items-center justify-center px-4 text-center text-sm text-slate-400">
          {isLoading ? "Loading preview" : "Preview unavailable"}
        </div>
      )}
    </div>
  );
}
