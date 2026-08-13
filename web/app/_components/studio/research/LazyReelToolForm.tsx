import { LazyReelBreakoutLawsForm } from "./LazyReelBreakoutLawsForm";
import { LazyReelKillTheSlopForm } from "./LazyReelKillTheSlopForm";
import { LazyReelMakeBriefForm } from "./LazyReelMakeBriefForm";
import { LazyReelNicheReportForm } from "./LazyReelNicheReportForm";
import { LazyReelStatusForm } from "./LazyReelStatusForm";
import { LazyReelStudyVideosForm } from "./LazyReelStudyVideosForm";
import { LazyReelTeardownForm } from "./LazyReelTeardownForm";
import type { LazyReelResearchCatalog } from "@/lib/clipstitchr/types/lazyreel/LazyReelResearchCatalog";
import type { LazyReelToolKey } from "@/lib/clipstitchr/types/lazyreel/LazyReelToolKey";
import type { LazyReelToolRequest } from "@/lib/clipstitchr/types/lazyreel/LazyReelToolRequest";

type LazyReelToolFormProps = {
  catalog: LazyReelResearchCatalog | null;
  isRunning: boolean;
  onSubmit: (request: LazyReelToolRequest) => Promise<void>;
  productName: string;
  tool: LazyReelToolKey;
};

export function LazyReelToolForm({
  catalog,
  isRunning,
  onSubmit,
  productName,
  tool,
}: LazyReelToolFormProps) {
  switch (tool) {
    case "niche_report":
      return <LazyReelNicheReportForm catalog={catalog} isRunning={isRunning} onSubmit={onSubmit} />;
    case "study_videos":
      return <LazyReelStudyVideosForm catalog={catalog} isRunning={isRunning} onSubmit={onSubmit} />;
    case "teardown":
      return <LazyReelTeardownForm catalog={catalog} isRunning={isRunning} onSubmit={onSubmit} productName={productName} />;
    case "make_brief":
      return <LazyReelMakeBriefForm catalog={catalog} isRunning={isRunning} onSubmit={onSubmit} productName={productName} />;
    case "breakout_laws":
      return <LazyReelBreakoutLawsForm isRunning={isRunning} onSubmit={onSubmit} />;
    case "kill_the_slop":
      return <LazyReelKillTheSlopForm isRunning={isRunning} onSubmit={onSubmit} />;
    case "get_status":
      return <LazyReelStatusForm isRunning={isRunning} onSubmit={onSubmit} />;
  }
}
