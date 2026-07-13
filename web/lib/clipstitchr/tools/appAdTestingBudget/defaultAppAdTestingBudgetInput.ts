import type { AppAdTestingBudgetInput } from "@/lib/clipstitchr/tools/appAdTestingBudget/AppAdTestingBudgetInput";

export const defaultAppAdTestingBudgetInput: AppAdTestingBudgetInput = {
  activeCellCount: 6,
  backlogCellCount: 8,
  minimumEvidenceSpendPerCell: 500,
  productionPercent: 25,
  reservePercent: 10,
  totalBudget: 5_000,
};
