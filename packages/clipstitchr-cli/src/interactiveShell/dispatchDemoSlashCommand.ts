import type { CliGlobalOptions } from "../commands/CliGlobalOptions.js";
import type { InteractiveShellServices } from "./InteractiveShellServices.js";
import { getSlashCommandGlobalOptions } from "./getSlashCommandGlobalOptions.js";
import { parseSlashCommandOptions } from "./parseSlashCommandOptions.js";
import { requireSlashCommandArgument } from "./requireSlashCommandArgument.js";

export async function dispatchDemoSlashCommand(input: {
  options: CliGlobalOptions;
  services: InteractiveShellServices;
  tokens: string[];
}) {
  const [subcommand, ...tokens] = input.tokens;

  if (!subcommand) {
    return { menu: "demo" as const };
  }

  if (subcommand === "manual" || subcommand === "make") {
    const parsed = parseSlashCommandOptions({
      booleanOptions: ["guide", "upload"],
      tokens,
      valueOptions: ["guide", "output", "product", "start", "url"],
    });

    await input.services.runDemoManual({
      ...getSlashCommandGlobalOptions({ parsed, shellOptions: input.options }),
      ...parsed.options,
    });
    return { menu: "demo" as const };
  }

  if (subcommand === "agent" || subcommand === "auto") {
    const parsed = parseSlashCommandOptions({
      booleanOptions: ["ai-planner", "upload"],
      tokens,
      valueOptions: [
        "audience",
        "driver",
        "goal",
        "guide",
        "openai-mode",
        "product",
        "start",
        "steps",
        "surface",
        "target",
        "url",
      ],
    });

    await input.services.runDemoAgent({
      ...getSlashCommandGlobalOptions({ parsed, shellOptions: input.options }),
      ...parsed.options,
    });
    return { menu: "demo" as const };
  }

  if (subcommand === "upload") {
    const parsed = parseSlashCommandOptions({
      booleanOptions: ["wait"],
      tokens,
      valueOptions: ["product"],
    });
    const filePath = requireSlashCommandArgument({
      argument: parsed.positionals[0],
      message: "Add a demo file path.",
    });

    await input.services.runDemoUpload(filePath, {
      ...getSlashCommandGlobalOptions({ parsed, shellOptions: input.options }),
      ...parsed.options,
    });
    return { menu: "demo" as const };
  }

  if (subcommand === "guide") {
    return await dispatchDemoGuideSlashCommand({
      options: input.options,
      services: input.services,
      tokens,
    });
  }

  if (subcommand === "policy") {
    return await dispatchDemoPolicySlashCommand({
      options: input.options,
      services: input.services,
      tokens,
    });
  }

  if (subcommand === "logs") {
    const parsed = parseSlashCommandOptions({
      tokens,
      valueOptions: ["output"],
    });
    const runId = requireSlashCommandArgument({
      argument: parsed.positionals[0],
      message: "Add an AI run ID.",
    });

    await input.services.demo.runLogs(runId, {
      ...getSlashCommandGlobalOptions({ parsed, shellOptions: input.options }),
      ...parsed.options,
    });
    return { menu: "demo" as const };
  }

  throw new Error(`Unknown demo command: ${subcommand}.`);
}

async function dispatchDemoGuideSlashCommand(input: {
  options: CliGlobalOptions;
  services: InteractiveShellServices;
  tokens: string[];
}) {
  const [subcommand, ...tokens] = input.tokens;

  if (subcommand === "create" || subcommand === "generate") {
    const parsed = parseSlashCommandOptions({
      tokens,
      valueOptions: ["product"],
    });

    await input.services.demo.runGuideCreate({
      ...getSlashCommandGlobalOptions({ parsed, shellOptions: input.options }),
      ...parsed.options,
    });
    return { menu: "demo" as const };
  }

  if (subcommand === "list") {
    const parsed = parseSlashCommandOptions({
      booleanOptions: ["all"],
      tokens,
    });

    await input.services.demo.runGuideList({
      ...getSlashCommandGlobalOptions({ parsed, shellOptions: input.options }),
      ...parsed.options,
    });
    return { menu: "demo" as const };
  }

  if (subcommand === "show" || subcommand === "edit") {
    const parsed = parseSlashCommandOptions({ tokens });
    const reference = requireSlashCommandArgument({
      argument: parsed.positionals[0],
      message: "Add a guide name, ID, or path.",
    });

    if (subcommand === "show") {
      await input.services.demo.runGuideShow(reference);
    } else {
      await input.services.demo.runGuideEdit(reference);
    }

    return { menu: "demo" as const };
  }

  if (subcommand === "delete") {
    const parsed = parseSlashCommandOptions({
      booleanOptions: ["yes"],
      tokens,
    });
    const reference = requireSlashCommandArgument({
      argument: parsed.positionals[0],
      message: "Add a guide name, ID, or path.",
    });

    await input.services.demo.runGuideDelete(reference, {
      ...getSlashCommandGlobalOptions({ parsed, shellOptions: input.options }),
      ...parsed.options,
    });
    return { menu: "demo" as const };
  }

  if (subcommand === "save-instructions" || subcommand === "export-instructions") {
    const parsed = parseSlashCommandOptions({
      tokens,
      valueOptions: ["output"],
    });
    const reference = requireSlashCommandArgument({
      argument: parsed.positionals[0],
      message: "Add a guide name, ID, or path.",
    });

    await input.services.runDemoGuideSaveInstructions(reference, {
      ...getSlashCommandGlobalOptions({ parsed, shellOptions: input.options }),
      ...parsed.options,
    });
    return { menu: "demo" as const };
  }

  throw new Error(`Unknown demo guide command: ${subcommand ?? ""}.`);
}

async function dispatchDemoPolicySlashCommand(input: {
  options: CliGlobalOptions;
  services: InteractiveShellServices;
  tokens: string[];
}) {
  const [subcommand, ...tokens] = input.tokens;
  const parsed = parseSlashCommandOptions({ tokens });
  const options = getSlashCommandGlobalOptions({
    parsed,
    shellOptions: input.options,
  });

  if (subcommand === "init") {
    await input.services.demo.runPolicyInit(options);
    return { menu: "demo" as const };
  }

  if (subcommand === "check") {
    await input.services.demo.runPolicyCheck(options);
    return { menu: "demo" as const };
  }

  if (subcommand === "edit") {
    await input.services.demo.runPolicyEdit(options);
    return { menu: "demo" as const };
  }

  throw new Error(`Unknown demo policy command: ${subcommand ?? ""}.`);
}
