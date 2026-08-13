import type { StudioClipsCandidate } from "@/lib/clipstitchr/hooks/studioClips/StudioClipsCandidate";
import { StudioClipsCandidateScore } from "./StudioClipsCandidateScore";
import { formatStudioClipsDuration } from "./formatStudioClipsDuration";
import styles from "@/app/dashboard/studio/clips/studioClips.module.css";

type StudioClipsOutputCandidateProps = {
  candidate: StudioClipsCandidate;
};

export function StudioClipsOutputCandidate({ candidate }: StudioClipsOutputCandidateProps) {
  return (
    <section className={styles.candidate} aria-labelledby={`candidate-${candidate.id}`}>
      <div className={styles.candidateHeading}>
        <div>
          <h4 id={`candidate-${candidate.id}`}>{candidate.title ?? "Candidate moment"}</h4>
          <p>{formatStudioClipsDuration(candidate.startSeconds)} - {formatStudioClipsDuration(candidate.endSeconds)}</p>
        </div>
      </div>
      <StudioClipsCandidateScore reasoning={candidate.reasoning} score={candidate.score} />
      {candidate.outputId ? <p className={styles.candidateOutput}>Prepared as output {candidate.outputId}</p> : null}
    </section>
  );
}
