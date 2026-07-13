import { CheckCircle2, TriangleAlert } from "lucide-react";
import type { SafeZoneAssessment } from "@/lib/clipstitchr/tools/tiktokSafeZone/SafeZoneAssessment";
import type { TikTokSafeZonePreset } from "@/lib/clipstitchr/tools/tiktokSafeZone/TikTokSafeZonePreset";

type SafeZoneAssessmentCardProps = {
  assessment: SafeZoneAssessment;
  preset: TikTokSafeZonePreset;
};

export function SafeZoneAssessmentCard({
  assessment,
  preset,
}: SafeZoneAssessmentCardProps) {
  return (
    <div className="marketing-card p-6" role="status" aria-live="polite">
      <div className="flex items-start gap-3">
        {assessment.clear ? (
          <CheckCircle2
            aria-hidden
            className="mt-0.5 h-6 w-6 text-emerald-600"
          />
        ) : (
          <TriangleAlert
            aria-hidden
            className="mt-0.5 h-6 w-6 text-amber-600"
          />
        )}
        <div>
          <h2 className="marketing-subheading text-2xl text-text-primary">
            {assessment.clear
              ? "Clear of this conservative overlay"
              : "Move the text away from the shaded UI buffers"}
          </h2>
          {assessment.intersectingLabels.length > 0 ? (
            <p className="mt-2 text-sm leading-6 text-text-secondary">
              Touching: {assessment.intersectingLabels.join(", ")}.
            </p>
          ) : (
            <p className="mt-2 text-sm leading-6 text-text-secondary">
              The planned box does not touch any buffer in this preset.
            </p>
          )}
        </div>
      </div>
      <div className="mt-5 rounded-lg bg-surface-muted p-4 text-sm leading-6 text-text-secondary">
        <p className="font-bold text-text-primary">
          {preset.name} · version {preset.version}
        </p>
        <p>Reference checked {preset.lastVerified}.</p>
        <p className="mt-2">
          This is a planning aid, not TikTok certification. Caption length,
          add-ons, language direction, device, and placement can change the real
          interface.
        </p>
        <a
          className="mt-3 inline-block font-bold text-accent-dark underline"
          href={preset.sourceUrl}
          rel="noreferrer"
          target="_blank"
        >
          Read TikTok&apos;s current In-Feed specification
        </a>
      </div>
    </div>
  );
}
