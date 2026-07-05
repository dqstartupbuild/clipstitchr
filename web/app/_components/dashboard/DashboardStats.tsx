import { Clapperboard, Film, Scissors } from "lucide-react";
import { DashboardStatCard } from "@/app/_components/dashboard/DashboardStatCard";

type DashboardStatsProps = {
  ugcCount: number;
  demoCount: number;
  stitchesCount: number;
};

export function DashboardStats({
  ugcCount,
  demoCount,
  stitchesCount,
}: DashboardStatsProps) {
  return (
    <section className="grid gap-4 md:grid-cols-3">
      <DashboardStatCard
        icon={<Film aria-hidden className="h-5 w-5" />}
        label="UGC clips"
        description="Creator clips ready to pair with a demo."
        value={ugcCount}
      />
      <DashboardStatCard
        icon={<Clapperboard aria-hidden className="h-5 w-5" />}
        label="Product demos"
        description="Walkthroughs that show the app."
        value={demoCount}
      />
      <DashboardStatCard
        icon={<Scissors aria-hidden className="h-5 w-5" />}
        label="Finished Stitches"
        description="Ads you can review, reuse, or post."
        value={stitchesCount}
      />
    </section>
  );
}
