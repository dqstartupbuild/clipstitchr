import { ClientContentCapacityStageFields } from "@/app/_components/tools/client-content-capacity-calculator/ClientContentCapacityStageFields";
import { ToolNumberField } from "@/app/_components/tools/ToolNumberField";
import { Panel } from "@/app/_components/ui/Panel";
import { PanelHeader } from "@/app/_components/ui/PanelHeader";
import type { ClientContentCapacityInput } from "@/lib/clipstitchr/tools/clientContentCapacity/ClientContentCapacityInput";
import { clientContentCapacityInputLimits } from "@/lib/clipstitchr/tools/clientContentCapacity/clientContentCapacityInputLimits";

type ClientContentCapacityFormProps = {
  onChange: (value: ClientContentCapacityInput) => void;
  value: ClientContentCapacityInput;
};

export function ClientContentCapacityForm({
  onChange,
  value,
}: ClientContentCapacityFormProps) {
  return (
    <Panel className="p-5 md:p-6">
      <PanelHeader
        eyebrow="Your weekly workflow"
        title="Measure every stage"
        description="The slowest entered stage sets the modeled output ceiling."
      />
      <div className="mt-6 grid gap-5">
        <div className="grid gap-5 sm:grid-cols-3">
          <ToolNumberField
            id="capacity-productive-percent"
            label="Productive-time share"
            description="The share of entered hours available after meetings and admin."
            max={clientContentCapacityInputLimits.percent}
            step={0.1}
            suffix="%"
            value={value.productiveTimePercent}
            onChange={(productiveTimePercent) =>
              onChange({ ...value, productiveTimePercent })
            }
          />
          <ToolNumberField
            id="capacity-deliverables-client"
            label="Deliverables per client"
            description="Average weekly commitment for one client."
            max={clientContentCapacityInputLimits.deliverableCount}
            step={0.1}
            value={value.deliverablesPerClientPerWeek}
            onChange={(deliverablesPerClientPerWeek) =>
              onChange({ ...value, deliverablesPerClientPerWeek })
            }
          />
          <ToolNumberField
            id="capacity-current-clients"
            label="Current clients"
            description="Clients currently sharing this capacity."
            max={clientContentCapacityInputLimits.clientCount}
            value={value.currentClientCount}
            onChange={(currentClientCount) =>
              onChange({ ...value, currentClientCount })
            }
          />
        </div>
        <ClientContentCapacityStageFields
          idPrefix="capacity-capture"
          label="Capture"
          value={value.capture}
          onChange={(capture) => onChange({ ...value, capture })}
        />
        <ClientContentCapacityStageFields
          idPrefix="capacity-editing"
          label="Editing"
          value={value.editing}
          onChange={(editing) => onChange({ ...value, editing })}
        />
        <ClientContentCapacityStageFields
          idPrefix="capacity-review"
          label="Review"
          value={value.review}
          onChange={(review) => onChange({ ...value, review })}
        />
      </div>
    </Panel>
  );
}
