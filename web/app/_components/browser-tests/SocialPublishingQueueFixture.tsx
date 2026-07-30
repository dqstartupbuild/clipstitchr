"use client";

import { useState } from "react";
import { SocialWeeklySlotRow } from "@/app/_components/social/SocialWeeklySlotRow";
import type { SocialWeeklySlot } from "@/lib/clipstitchr/social/types/SocialWeeklySlot";

export function SocialPublishingQueueFixture() {
  const [slots, setSlots] = useState<SocialWeeklySlot[]>([
    { dayOfWeek: 1, minuteOfDay: 10 * 60 },
    { dayOfWeek: 4, minuteOfDay: 15 * 60 + 30 },
  ]);

  return (
    <section
      className="rounded-lg bg-surface p-4 sm:p-6"
      aria-labelledby="browser-queue-workflow"
    >
      <h2
        id="browser-queue-workflow"
        className="text-xl font-bold text-text-primary"
      >
        Product posting times
      </h2>
      <p className="mt-2 text-sm leading-6 text-text-secondary">
        These times stay local to America/Detroit. The fixture never saves
        changes.
      </p>
      <div className="mt-4 grid gap-3">
        {slots.map((slot, index) => (
          <SocialWeeklySlotRow
            key={`${slot.dayOfWeek}:${slot.minuteOfDay}:${index}`}
            disabled={false}
            index={index}
            slot={slot}
            onChange={(changedIndex, changedSlot) =>
              setSlots((current) =>
                current.map((candidate, candidateIndex) =>
                  candidateIndex === changedIndex ? changedSlot : candidate,
                ),
              )
            }
            onRemove={(removeIndex) =>
              setSlots((current) =>
                current.filter((_, index) => index !== removeIndex),
              )
            }
          />
        ))}
        <button
          className="min-h-10 w-fit rounded-lg px-3 text-sm font-semibold text-accent-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          type="button"
          onClick={() =>
            setSlots((current) => [
              ...current,
              { dayOfWeek: 2, minuteOfDay: 12 * 60 },
            ])
          }
        >
          Add a posting time
        </button>
      </div>
      <p className="mt-3 text-sm font-semibold text-text-primary" role="status">
        Queue has {slots.length} posting {slots.length === 1 ? "time" : "times"}.
      </p>
    </section>
  );
}
