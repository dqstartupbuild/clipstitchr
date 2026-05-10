import { SWIPR_SLIDE_COUNT_OPTIONS } from "@/lib/clipstitchr/constants/swiprSlideCountOptions";

type SwiprSlideCountControlProps = {
  value: number;
  onChange: (count: number) => void;
};

export function SwiprSlideCountControl({
  value,
  onChange,
}: SwiprSlideCountControlProps) {
  return (
    <div>
      <p className="text-sm font-semibold text-text-primary">Images</p>
      <div className="mt-2 grid grid-cols-6 gap-2">
        {SWIPR_SLIDE_COUNT_OPTIONS.map((count) => {
          const isSelected = count === value;

          return (
            <button
              key={count}
              type="button"
              aria-pressed={isSelected}
              className={[
                "h-10 rounded-lg border text-sm font-bold transition-colors",
                isSelected
                  ? "border-accent bg-accent text-white"
                  : "border-border bg-white text-text-secondary hover:border-accent hover:text-accent",
              ].join(" ")}
              onClick={() => onChange(count)}
            >
              {count}
            </button>
          );
        })}
      </div>
    </div>
  );
}
