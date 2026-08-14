import type { SocialPublishingBestTimeSlot } from "@/lib/clipstitchr/types/SocialPublishingBestTimeSlot";
import { formatSocialPublishingNumber } from "@/lib/clipstitchr/utils/formatSocialPublishingNumber";
import { getSocialPublishingBestTimeLabel } from "@/lib/clipstitchr/utils/getSocialPublishingBestTimeLabel";

type SocialPublishingBestTimesSectionProps = {
  slots: SocialPublishingBestTimeSlot[];
};

export function SocialPublishingBestTimesSection({
  slots,
}: SocialPublishingBestTimesSectionProps) {
  return (
    <section className="rounded-lg bg-surface p-5 sm:p-6" aria-labelledby="best-posting-times">
      <h2 id="best-posting-times" className="text-xl font-bold text-text-primary">
        Best times to post
      </h2>
      <p className="mt-2 text-sm leading-6 text-text-secondary">
        Zernio ranks these UTC windows from your own post history.
      </p>
      {slots.length ? (
        <ol className="mt-5 grid gap-1">
          {slots.slice(0, 5).map((slot, index) => (
            <li
              key={`${slot.dayOfWeek}:${slot.hour}`}
              className="grid grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-3 py-3"
            >
              <span className="text-sm font-bold text-accent-dark">
                {index + 1}
              </span>
              <div>
                <p className="font-bold text-text-primary">
                  {getSocialPublishingBestTimeLabel(slot)}
                </p>
                <p className="mt-1 text-xs text-text-tertiary">
                  Based on {formatSocialPublishingNumber(slot.postCount)} posts
                </p>
              </div>
              <p className="text-right text-sm font-semibold text-text-secondary">
                {formatSocialPublishingNumber(Math.round(slot.averageEngagement))} avg. interactions
              </p>
            </li>
          ))}
        </ol>
      ) : (
        <p className="mt-5 text-sm font-semibold text-text-tertiary">
          Zernio needs more post history before it can recommend a time.
        </p>
      )}
    </section>
  );
}
