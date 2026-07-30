import type { SocialWeeklySlot } from "@/lib/clipstitchr/social/types/SocialWeeklySlot";

type SocialWeeklySlotRowProps = {
  disabled: boolean;
  index: number;
  slot: SocialWeeklySlot;
  onChange: (index: number, slot: SocialWeeklySlot) => void;
  onRemove: (index: number) => void;
};

const dayOptions = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export function SocialWeeklySlotRow({
  disabled,
  index,
  slot,
  onChange,
  onRemove,
}: SocialWeeklySlotRowProps) {
  const hour = Math.floor(slot.minuteOfDay / 60);
  const minute = slot.minuteOfDay % 60;
  const timeValue = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;

  return (
    <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-end">
      <label>
        <span className="text-sm font-semibold text-text-primary">Day</span>
        <select
          className="mt-1.5 h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm text-text-primary outline-none focus:border-accent"
          value={slot.dayOfWeek}
          disabled={disabled}
          onChange={(event) =>
            onChange(index, {
              ...slot,
              dayOfWeek: Number(event.currentTarget.value),
            })
          }
        >
          {dayOptions.map((day, dayOfWeek) => (
            <option key={day} value={dayOfWeek}>
              {day}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span className="text-sm font-semibold text-text-primary">
          Local time
        </span>
        <input
          className="mt-1.5 h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm text-text-primary outline-none focus:border-accent"
          type="time"
          value={timeValue}
          disabled={disabled}
          onChange={(event) => {
            const [nextHour, nextMinute] = event.currentTarget.value
              .split(":")
              .map(Number);

            if (
              !Number.isInteger(nextHour) ||
              !Number.isInteger(nextMinute)
            ) {
              return;
            }

            onChange(index, {
              ...slot,
              minuteOfDay: nextHour * 60 + nextMinute,
            });
          }}
        />
      </label>
      <button
        className="min-h-10 rounded-lg px-3 text-sm font-semibold text-red-300 hover:bg-red-950/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-60"
        type="button"
        disabled={disabled}
        onClick={() => onRemove(index)}
      >
        Remove
      </button>
    </div>
  );
}
