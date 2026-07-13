export type AppAdTestingBudgetResult = {
  activeCellCount: number;
  backlogCellCount: number;
  evidenceGap: number;
  fundedActiveCellCount: number;
  mediaBudget: number;
  mediaPercent: number;
  mediaSpendPerActiveCell: number | null;
  minimumEvidenceSpendPerCell: number;
  productionBudget: number;
  productionPercent: number;
  requiredEvidenceSpend: number;
  reserveBudget: number;
  reservePercent: number;
  totalBudget: number;
};
