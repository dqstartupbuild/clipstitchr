import { ShieldCheck } from "lucide-react";

export function DevelopmentPreviewIndicator() {
  return (
    <div
      className="mb-6 flex items-center gap-3 rounded-md bg-amber-100 px-4 py-3 text-sm text-amber-950"
      role="status"
    >
      <ShieldCheck aria-hidden className="h-4 w-4 shrink-0" />
      <p>
        <strong>Development preview</strong>
        <span className="ml-2 text-amber-900">
          Local fixtures only. Uploads, publishing, paid work, and account changes are paused.
        </span>
      </p>
    </div>
  );
}
