import { ToolNumberField } from "@/app/_components/tools/ToolNumberField";
import { Panel } from "@/app/_components/ui/Panel";
import { PanelHeader } from "@/app/_components/ui/PanelHeader";
import type { AppAdTestingBudgetInput } from "@/lib/clipstitchr/tools/appAdTestingBudget/AppAdTestingBudgetInput";
import { appAdTestingBudgetInputLimits } from "@/lib/clipstitchr/tools/appAdTestingBudget/appAdTestingBudgetInputLimits";

type AppAdTestingBudgetFormProps = {
  onChange: (value: AppAdTestingBudgetInput) => void;
  value: AppAdTestingBudgetInput;
};

export function AppAdTestingBudgetForm({
  onChange,
  value,
}: AppAdTestingBudgetFormProps) {
  return (
    <Panel className="p-5 md:p-6">
      <PanelHeader
        eyebrow="Your budget rules"
        title="Choose the split yourself"
        description="The planner allocates your inputs. It does not recommend spend."
      />
      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <ToolNumberField
            id="testing-total-budget"
            label="Total testing budget"
            description="The full amount you want to divide."
            max={appAdTestingBudgetInputLimits.money}
            step={0.01}
            suffix="USD"
            value={value.totalBudget}
            onChange={(totalBudget) => onChange({ ...value, totalBudget })}
          />
        </div>
        <ToolNumberField
          id="testing-production-percent"
          label="Production allocation"
          description="Your chosen share for source footage and finishing."
          max={appAdTestingBudgetInputLimits.percent}
          step={0.1}
          suffix="%"
          value={value.productionPercent}
          onChange={(productionPercent) =>
            onChange({ ...value, productionPercent })
          }
        />
        <ToolNumberField
          id="testing-reserve-percent"
          label="Unassigned reserve"
          description="Your chosen share to leave outside active tests."
          max={appAdTestingBudgetInputLimits.percent}
          step={0.1}
          suffix="%"
          value={value.reservePercent}
          onChange={(reservePercent) => onChange({ ...value, reservePercent })}
        />
        <ToolNumberField
          id="testing-active-cells"
          label="Active test cells"
          description="Creative and audience cells you intend to fund now."
          max={appAdTestingBudgetInputLimits.cellCount}
          value={value.activeCellCount}
          onChange={(activeCellCount) =>
            onChange({ ...value, activeCellCount })
          }
        />
        <ToolNumberField
          id="testing-backlog-cells"
          label="Backlog cells"
          description="Ideas you want visible but unfunded in this allocation."
          max={appAdTestingBudgetInputLimits.cellCount}
          value={value.backlogCellCount}
          onChange={(backlogCellCount) =>
            onChange({ ...value, backlogCellCount })
          }
        />
        <div className="sm:col-span-2">
          <ToolNumberField
            id="testing-evidence-floor"
            label="Your evidence-spend floor per cell"
            description="The minimum media amount your team chose before reading a cell."
            max={appAdTestingBudgetInputLimits.money}
            step={0.01}
            suffix="USD"
            value={value.minimumEvidenceSpendPerCell}
            onChange={(minimumEvidenceSpendPerCell) =>
              onChange({ ...value, minimumEvidenceSpendPerCell })
            }
          />
        </div>
      </div>
    </Panel>
  );
}
