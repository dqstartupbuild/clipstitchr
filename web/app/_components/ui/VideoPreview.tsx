type VideoPreviewProps = {
  src: string | null;
  label: string;
  controls?: boolean;
  muted?: boolean;
};

export function VideoPreview({
  src,
  label,
  controls = true,
  muted = true,
}: VideoPreviewProps) {
  return (
    <div className="aspect-[9/16] overflow-hidden rounded-lg bg-slate-950">
      {src ? (
        <video
          key={src}
          aria-label={label}
          className="h-full w-full object-contain"
          controls={controls}
          muted={muted}
          playsInline
          preload="metadata"
          src={src}
        />
      ) : (
        <div className="flex h-full items-center justify-center px-4 text-center text-sm text-slate-400">
          Preview unavailable
        </div>
      )}
    </div>
  );
}
