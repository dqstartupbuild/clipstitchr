import type { StudioClipsCapabilities } from "@/lib/clipstitchr/hooks/studioClips/StudioClipsCapabilities";
import { getStudioClipsExecutionMessage } from "./getStudioClipsExecutionMessage";
import { getStudioClipsHumanLimitations } from "./getStudioClipsHumanLimitations";
import styles from "@/app/dashboard/studio/clips/studioClips.module.css";

type StudioClipsProviderNoticeProps = {
  capabilities: StudioClipsCapabilities;
};

export function StudioClipsProviderNotice({
  capabilities,
}: StudioClipsProviderNoticeProps) {
  const limitations = getStudioClipsHumanLimitations(capabilities);

  return (
    <aside className={styles.providerNotice} aria-labelledby="clips-provider-title">
      <div>
        <h2 id="clips-provider-title">
          {capabilities.execution.state === "available"
            ? "Current processing limits"
            : "Processing is unavailable here"}
        </h2>
        <p>
          {getStudioClipsExecutionMessage(capabilities)}
        </p>
      </div>
      {limitations.length > 0 ? (
        <details>
          <summary>Read {limitations.length} current limitation{limitations.length === 1 ? "" : "s"}</summary>
          <ul>
            {limitations.map((limitation) => <li key={limitation}>{limitation}</li>)}
          </ul>
        </details>
      ) : null}
    </aside>
  );
}
