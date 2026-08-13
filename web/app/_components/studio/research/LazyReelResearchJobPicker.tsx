import { LazyReelResearchJobButton } from "./LazyReelResearchJobButton";
import {
  lazyReelResearchToolDefinitions,
  lazyReelWorkflowDefinitions,
} from "./lazyReelResearchJobDefinitions";
import { getLazyReelResearchJobIsSelected } from "./getLazyReelResearchJobIsSelected";
import { selectLazyReelResearchJobDefinition } from "./selectLazyReelResearchJobDefinition";
import type { LazyReelResearchJobSelection } from "@/lib/clipstitchr/types/lazyreel/LazyReelResearchJobSelection";
import styles from "@/app/dashboard/studio/research/lazyReelResearch.module.css";

type LazyReelResearchJobPickerProps = {
  disabled: boolean;
  onSelect: (selection: LazyReelResearchJobSelection) => void;
  selection: LazyReelResearchJobSelection;
};

export function LazyReelResearchJobPicker({
  disabled,
  onSelect,
  selection,
}: LazyReelResearchJobPickerProps) {
  return (
    <aside className={styles.jobPicker} aria-label="Choose one research job">
      <details open>
        <summary>Research jobs</summary>
        <div className={styles.jobList}>
          {lazyReelResearchToolDefinitions.map((definition) => (
            <LazyReelResearchJobButton
              key={definition.key}
              definition={definition}
              disabled={disabled}
              isSelected={getLazyReelResearchJobIsSelected(
                selection,
                definition,
              )}
              onSelect={(definition) =>
                selectLazyReelResearchJobDefinition(definition, onSelect)
              }
            />
          ))}
        </div>
      </details>
      <details>
        <summary>Production planners</summary>
        <p className={styles.plannerDisclosure}>
          These prepare a production plan. They do not render a video.
        </p>
        <div className={styles.jobList}>
          {lazyReelWorkflowDefinitions.map((definition) => (
            <LazyReelResearchJobButton
              key={definition.key}
              definition={definition}
              disabled={disabled}
              isSelected={getLazyReelResearchJobIsSelected(
                selection,
                definition,
              )}
              onSelect={(definition) =>
                selectLazyReelResearchJobDefinition(definition, onSelect)
              }
            />
          ))}
        </div>
      </details>
    </aside>
  );
}
