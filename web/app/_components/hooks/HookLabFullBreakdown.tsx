import { HookLabBreakdownDisclosure } from "@/app/_components/hooks/HookLabBreakdownDisclosure";
import { HookLabCopyabilityWarningSection } from "@/app/_components/hooks/HookLabCopyabilityWarningSection";
import { HookLabFirstThreeSecondsSection } from "@/app/_components/hooks/HookLabFirstThreeSecondsSection";
import { HookLabFormatDnaSection } from "@/app/_components/hooks/HookLabFormatDnaSection";
import { HookLabMeaningSection } from "@/app/_components/hooks/HookLabMeaningSection";
import { HookLabPerformanceSection } from "@/app/_components/hooks/HookLabPerformanceSection";
import { HookLabPostCopySummary } from "@/app/_components/hooks/HookLabPostCopySummary";
import { HookLabPostTimeline } from "@/app/_components/hooks/HookLabPostTimeline";
import { HookLabUsefulTakeawaysSection } from "@/app/_components/hooks/HookLabUsefulTakeawaysSection";
import type { HookLabPost } from "@/lib/clipstitchr/types/HookLabPost";

export function HookLabFullBreakdown({ post }: { post: HookLabPost }) {
  if (!post.analysis) {
    return null;
  }

  const { analysis } = post;

  return (
    <div className="mx-auto grid w-full max-w-5xl gap-4">
      <header className="mb-2">
        <h3 className="text-balance text-2xl font-bold text-text-primary">
          Full breakdown
        </h3>
        <p className="mt-2 max-w-3xl text-pretty text-sm leading-6 text-text-secondary">
          Open only the part you need. The play-by-play contains the complete
          frame-to-frame recreation detail.
        </p>
      </header>

      <HookLabBreakdownDisclosure
        description="Every meaningful visual, reaction, object, spoken beat, cut, and likely implication."
        isOpen
        title="Play-by-play"
      >
        <HookLabPostTimeline timeline={analysis.timeline} />
      </HookLabBreakdownDisclosure>

      <HookLabBreakdownDisclosure
        description="The opening mechanics, likely meaning, remake essentials, and what may not transfer."
        title="Visual mechanics and meaning"
      >
        {analysis.formatDna ? (
          <>
            <HookLabFirstThreeSecondsSection formatDna={analysis.formatDna} />
            <HookLabFormatDnaSection formatDna={analysis.formatDna} />
            <HookLabCopyabilityWarningSection
              doNotCopy={analysis.formatDna.doNotCopy}
              warnings={analysis.copyabilityWarnings ?? []}
            />
          </>
        ) : null}
        <HookLabMeaningSection analysis={analysis} />
        <HookLabUsefulTakeawaysSection
          lessons={analysis.transferableLessons}
        />
      </HookLabBreakdownDisclosure>

      <HookLabBreakdownDisclosure
        description="The source caption and the on-screen wording found in the video."
        title="Words used in the post"
      >
        <HookLabPostCopySummary post={post} />
      </HookLabBreakdownDisclosure>

      <HookLabBreakdownDisclosure
        description="Public metrics, score context, likely strengths, and limitations."
        title="Performance and platform numbers"
      >
        <HookLabPerformanceSection post={post} />
      </HookLabBreakdownDisclosure>
    </div>
  );
}
