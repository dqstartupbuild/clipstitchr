import { Clapperboard, FileVideo, Film } from "lucide-react";
import { DashboardStatCard } from "@/app/_components/dashboard/DashboardStatCard";

type DashboardStatsProps = {
  ugcCount: number;
  demoCount: number;
  createdCount: number;
};

export function DashboardStats({
  ugcCount,
  demoCount,
  createdCount,
}: DashboardStatsProps) {
  return (
    <section className="grid gap-4 md:grid-cols-3">
      <DashboardStatCard
        icon={<Film aria-hidden className="h-5 w-5" />}
        label="UGC Clips"
        value={ugcCount}
      />
      <DashboardStatCard
        icon={<Clapperboard aria-hidden className="h-5 w-5" />}
        label="Demo Videos"
        value={demoCount}
      />
      <DashboardStatCard
        icon={<FileVideo aria-hidden className="h-5 w-5" />}
        label="Stitches"
        value={createdCount}
      />
    </section>
  );
}
