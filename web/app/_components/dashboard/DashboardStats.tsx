import { CirclePlay, Clapperboard, FileVideo, Film } from "lucide-react";
import { DashboardStatCard } from "@/app/_components/dashboard/DashboardStatCard";

type DashboardStatsProps = {
  ugcCount: number;
  demoCount: number;
  clipsCount: number;
  stitchesCount: number;
};

export function DashboardStats({
  ugcCount,
  demoCount,
  clipsCount,
  stitchesCount,
}: DashboardStatsProps) {
  return (
    <section className="grid gap-4 md:grid-cols-4">
      <DashboardStatCard
        icon={<Film aria-hidden className="h-5 w-5" />}
        label="UGC"
        value={ugcCount}
      />
      <DashboardStatCard
        icon={<Clapperboard aria-hidden className="h-5 w-5" />}
        label="Demo Videos"
        value={demoCount}
      />
      <DashboardStatCard
        icon={<CirclePlay aria-hidden className="h-5 w-5" />}
        label="Clips"
        value={clipsCount}
      />
      <DashboardStatCard
        icon={<FileVideo aria-hidden className="h-5 w-5" />}
        label="Stitches"
        value={stitchesCount}
      />
    </section>
  );
}
