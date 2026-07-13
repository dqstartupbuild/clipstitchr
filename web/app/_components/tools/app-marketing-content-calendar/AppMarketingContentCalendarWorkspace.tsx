"use client";

import { useState } from "react";
import { ResourceDownloadButton } from "@/app/_components/tools/resources/ResourceDownloadButton";
import type { AppMarketingCalendarInput } from "@/lib/clipstitchr/tools/appMarketingCalendar/AppMarketingCalendarInput";
import type { AppMarketingCalendarRow } from "@/lib/clipstitchr/tools/appMarketingCalendar/AppMarketingCalendarRow";
import { createAppMarketingCalendarCsv } from "@/lib/clipstitchr/tools/appMarketingCalendar/createAppMarketingCalendarCsv";
import { defaultAppMarketingCalendarInput } from "@/lib/clipstitchr/tools/appMarketingCalendar/defaultAppMarketingCalendarInput";
import { formatAppMarketingCalendarCampaigns } from "@/lib/clipstitchr/tools/appMarketingCalendar/formatAppMarketingCalendarCampaigns";
import { generateAppMarketingCalendar } from "@/lib/clipstitchr/tools/appMarketingCalendar/generateAppMarketingCalendar";
import { parseAppMarketingCalendarCampaigns } from "@/lib/clipstitchr/tools/appMarketingCalendar/parseAppMarketingCalendarCampaigns";

export function AppMarketingContentCalendarWorkspace() {
  const [input, setInput] = useState<AppMarketingCalendarInput>(
    defaultAppMarketingCalendarInput,
  );
  const [campaignText, setCampaignText] = useState(() =>
    formatAppMarketingCalendarCampaigns(
      defaultAppMarketingCalendarInput.campaigns,
    ),
  );
  const [rows, setRows] = useState<AppMarketingCalendarRow[]>(() =>
    generateAppMarketingCalendar(defaultAppMarketingCalendarInput),
  );

  return (
    <section className="px-6 py-16" aria-label="App marketing content calendar">
      <div className="mx-auto grid max-w-7xl gap-6">
        <div className="marketing-card grid gap-5 p-6 lg:grid-cols-3">
          <div className="lg:col-span-3">
            <p className="marketing-eyebrow">Calendar setup</p>
            <h2 className="marketing-subheading mt-2 text-3xl text-text-primary">
              Turn your campaign month into editable publishing slots.
            </h2>
          </div>
          <label className="grid gap-2 text-sm font-bold text-text-primary">
            Month
            <input
              className="h-11 rounded-lg border border-border bg-white px-3"
              onChange={(event) =>
                setInput({ ...input, month: event.target.value })
              }
              type="month"
              value={input.month}
            />
          </label>
          <label className="grid gap-2 text-sm font-bold text-text-primary">
            Posts each week
            <select
              className="h-11 rounded-lg border border-border bg-white px-3"
              onChange={(event) =>
                setInput({
                  ...input,
                  postsPerWeek: Number(
                    event.target.value,
                  ) as AppMarketingCalendarInput["postsPerWeek"],
                })
              }
              value={input.postsPerWeek}
            >
              <option value={2}>2 posts</option>
              <option value={3}>3 posts</option>
              <option value={5}>5 posts</option>
            </select>
          </label>
          <label className="grid gap-2 text-sm font-bold text-text-primary">
            Channels, separated by commas
            <input
              className="h-11 rounded-lg border border-border bg-white px-3"
              onChange={(event) =>
                setInput({
                  ...input,
                  channels: event.target.value.split(","),
                })
              }
              value={input.channels.join(", ")}
            />
          </label>
          <label className="grid gap-2 text-sm font-bold text-text-primary">
            Content pillars, separated by commas
            <input
              className="h-11 rounded-lg border border-border bg-white px-3"
              onChange={(event) =>
                setInput({
                  ...input,
                  pillars: event.target.value.split(","),
                })
              }
              value={input.pillars.join(", ")}
            />
          </label>
          <label className="grid gap-2 text-sm font-bold text-text-primary">
            Owners, separated by commas
            <input
              className="h-11 rounded-lg border border-border bg-white px-3"
              onChange={(event) =>
                setInput({
                  ...input,
                  owners: event.target.value.split(","),
                })
              }
              value={input.owners.join(", ")}
            />
          </label>
          <label className="grid gap-2 text-sm font-bold text-text-primary">
            Source assets, separated by commas
            <input
              className="h-11 rounded-lg border border-border bg-white px-3"
              onChange={(event) =>
                setInput({ ...input, assets: event.target.value.split(",") })
              }
              value={input.assets.join(", ")}
            />
          </label>
          <label className="grid gap-2 text-sm font-bold text-text-primary lg:col-span-2">
            Campaign dates, one per line: date | name
            <textarea
              className="min-h-24 rounded-lg border border-border bg-white p-3"
              maxLength={600}
              onChange={(event) => {
                setCampaignText(event.target.value);
                setInput({
                  ...input,
                  campaigns: parseAppMarketingCalendarCampaigns(
                    event.target.value,
                  ),
                });
              }}
              placeholder="2026-01-20 | Paid launch"
              value={campaignText}
            />
          </label>
          <button
            className="h-11 self-end rounded-lg bg-accent px-5 text-sm font-bold text-white hover:bg-accent-dark"
            onClick={() => setRows(generateAppMarketingCalendar(input))}
            type="button"
          >
            Build calendar
          </button>
        </div>

        <div className="marketing-card overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border p-6">
            <div>
              <p className="marketing-eyebrow">Editable calendar</p>
              <h2 className="marketing-subheading mt-2 text-3xl text-text-primary">
                {rows.length} publishing slots
              </h2>
              <p className="mt-2 text-sm text-text-secondary">
                Change source assets and statuses, then download the current
                rows.
              </p>
            </div>
            <ResourceDownloadButton
              contents={createAppMarketingCalendarCsv(rows)}
              fileName="clipstitchr-app-marketing-calendar.csv"
              label="Download CSV"
              type="text/csv;charset=utf-8"
            />
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-surface-muted text-text-secondary">
                <tr>
                  {[
                    "Date",
                    "Channel",
                    "Pillar",
                    "CTA role",
                    "Owner",
                    "Source asset",
                    "Status",
                  ].map((heading) => (
                    <th className="px-4 py-3 font-bold" key={heading}>
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr className="border-t border-border align-top" key={row.id}>
                    <td className="whitespace-nowrap px-4 py-3 font-semibold">
                      {row.date}
                    </td>
                    <td className="px-4 py-3">{row.channel}</td>
                    <td className="px-4 py-3">{row.pillar}</td>
                    <td className="px-4 py-3">{row.ctaRole}</td>
                    <td className="px-4 py-3">{row.owner}</td>
                    <td className="min-w-48 px-4 py-3">
                      <input
                        aria-label={`Source asset for ${row.date}`}
                        className="h-10 w-full rounded-lg border border-border bg-white px-3"
                        maxLength={100}
                        onChange={(event) =>
                          setRows(
                            rows.map((item) =>
                              item.id === row.id
                                ? { ...item, asset: event.target.value }
                                : item,
                            ),
                          )
                        }
                        value={row.asset}
                      />
                    </td>
                    <td className="min-w-40 px-4 py-3">
                      <select
                        aria-label={`Status for ${row.date}`}
                        className="h-10 w-full rounded-lg border border-border bg-white px-3"
                        onChange={(event) =>
                          setRows(
                            rows.map((item) =>
                              item.id === row.id
                                ? { ...item, status: event.target.value }
                                : item,
                            ),
                          )
                        }
                        value={row.status}
                      >
                        <option>Planned</option>
                        <option>Capturing</option>
                        <option>Ready</option>
                        <option>Published</option>
                        <option>Skipped</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
