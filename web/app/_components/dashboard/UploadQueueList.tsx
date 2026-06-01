import { ProgressBar } from "@/app/_components/ui/ProgressBar";
import type { UploadQueueItem } from "@/lib/clipstitchr/types/UploadQueueItem";
import { formatBytes } from "@/lib/clipstitchr/utils/formatBytes";

type UploadQueueListProps = {
  queue: UploadQueueItem[];
};

function getQueueStatusLabel(item: UploadQueueItem) {
  if (item.error) {
    return "Failed";
  }

  switch (item.status) {
    case "queued":
      return "Queued";
    case "reading":
      return "Uploading";
    case "saving":
      return "Creating job";
    case "complete":
      return "Complete";
    default:
      return `${Math.round(item.progress * 100)}%`;
  }
}

export function UploadQueueList({ queue }: UploadQueueListProps) {
  if (queue.length === 0) {
    return null;
  }

  return (
    <div className="mt-5 space-y-3">
      {queue.map((item) => (
        <div key={item.id} className="rounded-lg border border-border bg-white p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-text-primary">
                {item.fileName}
              </p>
              <p className="mt-1 text-xs text-text-tertiary">
                {item.clipType.toUpperCase()} . {formatBytes(item.fileSize)}
              </p>
            </div>
            <span className="text-xs font-semibold text-text-secondary">
              {getQueueStatusLabel(item)}
            </span>
          </div>
          <div className="mt-3">
            <ProgressBar value={item.progress} />
          </div>
          {item.error ? (
            <p className="mt-3 text-sm text-red-600">{item.error}</p>
          ) : null}
        </div>
      ))}
    </div>
  );
}
