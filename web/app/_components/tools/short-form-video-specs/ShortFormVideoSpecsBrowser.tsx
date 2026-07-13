"use client";

import { useMemo, useState } from "react";
import { ShortFormVideoSpecCard } from "@/app/_components/tools/short-form-video-specs/ShortFormVideoSpecCard";
import { filterShortFormVideoSpecs } from "@/lib/clipstitchr/tools/shortFormVideoSpecs/filterShortFormVideoSpecs";
import type { ShortFormVideoPlatform } from "@/lib/clipstitchr/tools/shortFormVideoSpecs/ShortFormVideoPlatform";
import { shortFormVideoPlatforms } from "@/lib/clipstitchr/tools/shortFormVideoSpecs/shortFormVideoPlatforms";
import { shortFormVideoSpecRecords } from "@/lib/clipstitchr/tools/shortFormVideoSpecs/shortFormVideoSpecRecords";

export function ShortFormVideoSpecsBrowser() {
  const [platform, setPlatform] = useState<ShortFormVideoPlatform | "All">(
    "All",
  );
  const [query, setQuery] = useState("");
  const visibleRecords = useMemo(
    () => filterShortFormVideoSpecs(shortFormVideoSpecRecords, platform, query),
    [platform, query],
  );

  return (
    <section
      className="px-6 py-16 md:py-20"
      aria-label="Video specification records"
    >
      <div className="mx-auto max-w-6xl">
        <div className="marketing-card grid gap-4 p-6 md:grid-cols-[0.6fr_1.4fr] md:items-end">
          <label className="grid gap-2 text-sm font-bold text-text-primary">
            Platform
            <select
              className="h-11 rounded-lg border border-border bg-white px-3 text-sm font-semibold text-text-primary outline-none focus:border-accent"
              onChange={(event) =>
                setPlatform(
                  event.target.value as ShortFormVideoPlatform | "All",
                )
              }
              value={platform}
            >
              <option value="All">All platforms</option>
              {shortFormVideoPlatforms.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-bold text-text-primary">
            Search the records
            <input
              className="h-11 rounded-lg border border-border bg-white px-3 text-sm font-medium text-text-primary outline-none placeholder:text-text-tertiary focus:border-accent"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Try 9:16, 60 seconds, sound, or MPG"
              type="search"
              value={query}
            />
          </label>
        </div>

        <p
          className="mt-5 text-sm font-semibold text-text-secondary"
          role="status"
        >
          Showing {visibleRecords.length} of {shortFormVideoSpecRecords.length}{" "}
          dated records.
        </p>
        <div className="mt-6 grid gap-6">
          {visibleRecords.map((record) => (
            <ShortFormVideoSpecCard key={record.id} record={record} />
          ))}
          {visibleRecords.length === 0 ? (
            <div className="marketing-card p-8 text-center text-sm leading-6 text-text-secondary">
              No record matches those filters. Try a platform name, ratio,
              duration, audio note, or file format.
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
