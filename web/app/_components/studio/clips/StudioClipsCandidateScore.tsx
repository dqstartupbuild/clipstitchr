import type { StudioClipsCandidateScore as CandidateScore } from "@/lib/clipstitchr/hooks/studioClips/StudioClipsCandidateScore";
import styles from "@/app/dashboard/studio/clips/studioClips.module.css";

type StudioClipsCandidateScoreProps = {
  reasoning: string[];
  score: CandidateScore;
};

export function StudioClipsCandidateScore({ reasoning, score }: StudioClipsCandidateScoreProps) {
  const breakdown = [
    ["Hook", score.hook],
    ["Clarity", score.clarity],
    ["Retention", score.retention],
    ["Shareability", score.shareability],
  ].filter((item): item is [string, number] => typeof item[1] === "number");

  return (
    <section className={styles.score} aria-label="Candidate score and reasoning">
      <div className={styles.overallScore}>
        <span>Candidate score</span>
        <strong>{score.overall.toFixed(score.overall % 1 ? 1 : 0)}</strong>
      </div>
      {breakdown.length > 0 ? (
        <dl>
          {breakdown.map(([label, value]) => (
            <div key={label}><dt>{label}</dt><dd>{value}</dd></div>
          ))}
        </dl>
      ) : null}
      <ul className={styles.scoreReasoning}>
        {reasoning.map((reason) => <li key={reason}>{reason}</li>)}
      </ul>
    </section>
  );
}
