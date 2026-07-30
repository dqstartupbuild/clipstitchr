"use client";

import { useMemo, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { SocialWeeklySlotRow } from "@/app/_components/social/SocialWeeklySlotRow";
import { Button } from "@/app/_components/ui/Button";
import { listBrowserTimeZones } from "@/lib/clipstitchr/client/listBrowserTimeZones";
import type { SocialWeeklySlot } from "@/lib/clipstitchr/social/types/SocialWeeklySlot";

type ProductSocialQueueFormProps = {
  onSaved: (message: string) => void;
  productId: string;
  queue: Doc<"productSocialQueues">;
};

export function ProductSocialQueueForm({
  onSaved,
  productId,
  queue,
}: ProductSocialQueueFormProps) {
  const saveQueue = useMutation(
    api.productSocialQueues.upsertProductSocialQueue.upsertProductSocialQueue,
  );
  const timeZones = useMemo(() => listBrowserTimeZones(), []);
  const [timeZone, setTimeZone] = useState(queue.timezone);
  const [slots, setSlots] = useState<SocialWeeklySlot[]>(queue.weeklySlots);
  const [isActive, setIsActive] = useState(!queue.paused);
  const [reflowFuturePosts, setReflowFuturePosts] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);

    try {
      const result = await saveQueue({
        productId,
        timezone: timeZone,
        weeklySlots: slots,
        paused: !isActive,
        reflowFuturePosts,
        now: new Date().toISOString(),
      });
      onSaved(
        result.reflowedPostCount > 0
          ? `${result.reflowedPostCount} future queued post${result.reflowedPostCount === 1 ? "" : "s"} moved to the new times.`
          : "Posting times saved.",
      );
      setReflowFuturePosts(false);
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : "Unable to save posting times.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mt-4 grid gap-4">
      <label className="flex items-center gap-3 text-sm font-semibold text-text-primary">
        <input
          type="checkbox"
          checked={isActive}
          disabled={isSaving}
          onChange={(event) => setIsActive(event.currentTarget.checked)}
        />
        Use this posting queue
      </label>
      <label>
        <span className="text-sm font-semibold text-text-primary">
          Time zone
        </span>
        <select
          className="mt-1.5 h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm text-text-primary outline-none focus:border-accent"
          value={timeZone}
          disabled={isSaving}
          onChange={(event) => setTimeZone(event.currentTarget.value)}
        >
          {!timeZones.includes(timeZone) ? (
            <option value={timeZone}>{timeZone}</option>
          ) : null}
          {timeZones.map((zone) => (
            <option key={zone} value={zone}>
              {zone.replaceAll("_", " ")}
            </option>
          ))}
        </select>
      </label>
      <div className="grid gap-3">
        {slots.map((slot, index) => (
          <SocialWeeklySlotRow
            key={`${slot.dayOfWeek}:${slot.minuteOfDay}:${index}`}
            disabled={isSaving}
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
          className="w-fit rounded-lg px-2 py-2 text-sm font-semibold text-accent-dark hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          type="button"
          disabled={isSaving}
          onClick={() =>
            setSlots((current) => [
              ...current,
              { dayOfWeek: 1, minuteOfDay: 10 * 60 },
            ])
          }
        >
          Add a posting time
        </button>
      </div>
      <label className="flex items-start gap-3 rounded-lg bg-surface-elevated p-3 text-sm leading-6 text-text-secondary">
        <input
          className="mt-1"
          type="checkbox"
          checked={reflowFuturePosts}
          disabled={isSaving}
          onChange={(event) =>
            setReflowFuturePosts(event.currentTarget.checked)
          }
        />
        <span>
          Move future queued posts to these new times. Exact-time posts and
          anything already started will stay where they are.
        </span>
      </label>
      {error ? (
        <p className="text-sm font-semibold text-red-300" role="alert">
          {error}
        </p>
      ) : null}
      <div>
        <Button
          type="button"
          size="sm"
          isLoading={isSaving}
          onClick={() => void handleSave()}
        >
          Save posting times
        </Button>
      </div>
    </div>
  );
}
