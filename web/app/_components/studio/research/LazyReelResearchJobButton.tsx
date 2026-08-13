import type { LazyReelResearchJobDefinition } from "./lazyReelResearchJobDefinitions";
import styles from "@/app/dashboard/studio/research/lazyReelResearch.module.css";

type LazyReelResearchJobButtonProps = {
  definition: LazyReelResearchJobDefinition;
  disabled: boolean;
  isSelected: boolean;
  onSelect: (definition: LazyReelResearchJobDefinition) => void;
};

export function LazyReelResearchJobButton({
  definition,
  disabled,
  isSelected,
  onSelect,
}: LazyReelResearchJobButtonProps) {
  return (
    <button
      aria-pressed={isSelected}
      className={styles.jobButton}
      disabled={disabled}
      onClick={() => onSelect(definition)}
      type="button"
    >
      <strong>{definition.title}</strong>
      <span>{definition.description}</span>
    </button>
  );
}
