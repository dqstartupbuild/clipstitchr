import type { StudioClipsCapabilities } from "@/lib/clipstitchr/hooks/studioClips/StudioClipsCapabilities";
import type { StudioClipsTaskDetail } from "@/lib/clipstitchr/hooks/studioClips/StudioClipsTaskDetail";
import { StudioClipsOutputCandidate } from "./StudioClipsOutputCandidate";
import { StudioClipsTranscript } from "./StudioClipsTranscript";
import styles from "@/app/dashboard/studio/clips/studioClips.module.css";

type StudioClipsAnalysisViewProps = {
  capabilities: StudioClipsCapabilities;
  task: StudioClipsTaskDetail;
};

export function StudioClipsAnalysisView({
  capabilities,
  task,
}: StudioClipsAnalysisViewProps) {
  if (!task.analysis) {
    return (
      <section className={styles.analysisUnavailable} aria-labelledby="studio-clips-analysis-title" data-state={capabilities.analysis.state}>
        <h2 id="studio-clips-analysis-title">Transcript and candidate evidence</h2>
        <p>
          Transcript excerpts, clip candidates, scores, and reasoning will
          appear after clip processing is connected and finishes.
        </p>
      </section>
    );
  }

  return (
    <section className={styles.analysis} aria-labelledby="studio-clips-analysis-title">
      <div className={styles.analysisHeading}>
        <h2 id="studio-clips-analysis-title">Transcript and candidate evidence</h2>
        <span>{task.analysis.candidates.length} candidate{task.analysis.candidates.length === 1 ? "" : "s"}</span>
      </div>
      {task.analysis.summary ? <p className={styles.analysisSummary}>{task.analysis.summary}</p> : null}
      <StudioClipsTranscript excerpts={task.analysis.transcriptExcerpts} />
      {task.analysis.candidates.length === 0 ? (
        <p className={styles.emptyEvidence}>No candidate moment met the analysis threshold.</p>
      ) : (
        <div className={styles.candidateList}>
          {task.analysis.candidates.map((candidate) => (
            <StudioClipsOutputCandidate candidate={candidate} key={candidate.id} />
          ))}
        </div>
      )}
    </section>
  );
}
