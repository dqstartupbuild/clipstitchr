import { ExternalLink } from "lucide-react";
import { ShortFormVideoSpecField } from "@/app/_components/tools/short-form-video-specs/ShortFormVideoSpecField";
import type { ShortFormVideoSpecRecord } from "@/lib/clipstitchr/tools/shortFormVideoSpecs/ShortFormVideoSpecRecord";

type ShortFormVideoSpecCardProps = {
  record: ShortFormVideoSpecRecord;
};

export function ShortFormVideoSpecCard({
  record,
}: ShortFormVideoSpecCardProps) {
  return (
    <article className="marketing-card p-6 md:p-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-accent-dark">
            {record.platform}
          </p>
          <h2 className="marketing-subheading mt-2 text-2xl text-text-primary">
            {record.placement}
          </h2>
        </div>
        <span className="rounded-full border border-border bg-white px-3 py-1 text-xs font-bold text-text-secondary">
          Checked {record.lastVerified}
        </span>
      </div>

      <dl className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <ShortFormVideoSpecField label="Aspect ratio" value={record.ratio} />
        <ShortFormVideoSpecField label="Dimensions" value={record.dimensions} />
        <ShortFormVideoSpecField label="Duration" value={record.duration} />
        <ShortFormVideoSpecField label="Container" value={record.containers} />
        <ShortFormVideoSpecField label="Codec" value={record.codec} />
        <ShortFormVideoSpecField label="Frame rate" value={record.frameRate} />
        <ShortFormVideoSpecField label="Audio" value={record.audio} />
        <ShortFormVideoSpecField
          label="File or bitrate limit"
          value={record.fileLimit}
        />
      </dl>

      <div className="mt-6">
        <h3 className="font-bold text-text-primary">
          Practical recording notes
        </h3>
        <ul className="mt-3 grid gap-2 text-sm leading-6 text-text-secondary">
          {record.practicalNotes.map((note) => (
            <li className="flex gap-2" key={note}>
              <span aria-hidden className="font-black text-accent-dark">
                •
              </span>
              <span>{note}</span>
            </li>
          ))}
        </ul>
      </div>

      <a
        className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-accent-dark underline"
        href={record.sourceUrl}
        rel="noreferrer"
        target="_blank"
      >
        {record.sourceTitle}
        <ExternalLink aria-hidden className="h-4 w-4" />
      </a>
    </article>
  );
}
