import { ClipNamingTokenOrder } from "@/app/_components/tools/clip-naming-system-generator/ClipNamingTokenOrder";
import { Panel } from "@/app/_components/ui/Panel";
import { PanelHeader } from "@/app/_components/ui/PanelHeader";
import type { ClipNamingSystemInput } from "@/lib/clipstitchr/tools/clipNamingSystem/ClipNamingSystemInput";
import { clipNamingTokenLabels } from "@/lib/clipstitchr/tools/clipNamingSystem/clipNamingTokenLabels";
import { clipNamingTokens } from "@/lib/clipstitchr/tools/clipNamingSystem/clipNamingTokens";

type ClipNamingSystemFormProps = {
  onChange: (value: ClipNamingSystemInput) => void;
  value: ClipNamingSystemInput;
};

export function ClipNamingSystemForm({
  onChange,
  value,
}: ClipNamingSystemFormProps) {
  return (
    <Panel className="p-5 md:p-6">
      <PanelHeader
        eyebrow="Naming ingredients"
        title="Describe one representative clip"
        description="The preview updates as you type. Invalid filename characters are removed from the copied result."
      />
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {clipNamingTokens.map((token) => (
          <label
            key={token}
            className="block text-sm font-semibold text-text-primary"
          >
            {clipNamingTokenLabels[token]}
            <input
              type={token === "date" ? "date" : "text"}
              value={value[token]}
              maxLength={80}
              className="mt-2 h-11 w-full rounded-lg border border-border bg-surface px-3 text-base text-text-primary outline-none focus:border-accent focus:ring-2 focus:ring-accent/15"
              onChange={(event) =>
                onChange({ ...value, [token]: event.currentTarget.value })
              }
            />
          </label>
        ))}
      </div>
      <fieldset className="mt-6">
        <legend className="text-sm font-semibold text-text-primary">
          Separator
        </legend>
        <div className="mt-2 flex gap-3">
          {(["_", "-"] as const).map((separator) => (
            <label
              key={separator}
              className="flex items-center gap-2 text-sm text-text-secondary"
            >
              <input
                type="radio"
                name="clip-naming-separator"
                checked={value.separator === separator}
                onChange={() => onChange({ ...value, separator })}
              />
              {separator === "_" ? "Underscore" : "Hyphen"} ({separator})
            </label>
          ))}
        </div>
      </fieldset>
      <div className="mt-6">
        <ClipNamingTokenOrder
          value={value.tokenOrder}
          onChange={(tokenOrder) => onChange({ ...value, tokenOrder })}
        />
      </div>
    </Panel>
  );
}
