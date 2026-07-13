import type { AppAdTestingBudgetInput } from "@/lib/clipstitchr/tools/appAdTestingBudget/AppAdTestingBudgetInput";
import type { AppAdTestingBudgetResult } from "@/lib/clipstitchr/tools/appAdTestingBudget/AppAdTestingBudgetResult";
import { appAdTestingBudgetInputLimits } from "@/lib/clipstitchr/tools/appAdTestingBudget/appAdTestingBudgetInputLimits";
import { normalizeBoundedCount } from "@/lib/clipstitchr/tools/numbers/normalizeBoundedCount";
import { normalizeBoundedDecimal } from "@/lib/clipstitchr/tools/numbers/normalizeBoundedDecimal";

export function calculateAppAdTestingBudget(
  input: AppAdTestingBudgetInput,
): AppAdTestingBudgetResult {
  const totalBudget = normalizeBoundedDecimal(
    input.totalBudget,
    appAdTestingBudgetInputLimits.money,
  );
  const productionPercent = normalizeBoundedDecimal(
    input.productionPercent,
    appAdTestingBudgetInputLimits.percent,
  );
  const requestedReservePercent = normalizeBoundedDecimal(
    input.reservePercent,
    appAdTestingBudgetInputLimits.percent,
  );
  const reservePercent = Math.min(
    requestedReservePercent,
    100 - productionPercent,
  );
  const mediaPercent = 100 - productionPercent - reservePercent;
  const activeCellCount = normalizeBoundedCount(
    input.activeCellCount,
    appAdTestingBudgetInputLimits.cellCount,
  );
  const backlogCellCount = normalizeBoundedCount(
    input.backlogCellCount,
    appAdTestingBudgetInputLimits.cellCount,
  );
  const minimumEvidenceSpendPerCell = normalizeBoundedDecimal(
    input.minimumEvidenceSpendPerCell,
    appAdTestingBudgetInputLimits.money,
  );
  const productionBudget = totalBudget * (productionPercent / 100);
  const reserveBudget = totalBudget * (reservePercent / 100);
  const mediaBudget = totalBudget - productionBudget - reserveBudget;
  const requiredEvidenceSpend = activeCellCount * minimumEvidenceSpendPerCell;
  const fundedActiveCellCount =
    minimumEvidenceSpendPerCell === 0
      ? activeCellCount
      : Math.min(
          activeCellCount,
          Math.floor(mediaBudget / minimumEvidenceSpendPerCell),
        );

  return {
    activeCellCount,
    backlogCellCount,
    evidenceGap: Math.max(requiredEvidenceSpend - mediaBudget, 0),
    fundedActiveCellCount,
    mediaBudget,
    mediaPercent,
    mediaSpendPerActiveCell:
      activeCellCount === 0 ? null : mediaBudget / activeCellCount,
    minimumEvidenceSpendPerCell,
    productionBudget,
    productionPercent,
    requiredEvidenceSpend,
    reserveBudget,
    reservePercent,
    totalBudget,
  };
}
