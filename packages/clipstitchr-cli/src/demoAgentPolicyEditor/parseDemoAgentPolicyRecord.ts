export function parseDemoAgentPolicyRecord(value: string) {
  return Object.fromEntries(
    value
      .split(/[\n,]/)
      .map((entry) => entry.trim())
      .filter(Boolean)
      .map((entry) => {
        const separatorIndex = entry.indexOf("=");

        if (separatorIndex === -1) {
          return ["", ""];
        }

        return [
          entry.slice(0, separatorIndex).trim(),
          entry.slice(separatorIndex + 1).trim(),
        ];
      })
      .filter(([key, recordValue]) => key && recordValue),
  );
}
