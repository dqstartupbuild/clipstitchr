import type {
  CliDemoAgentGuideContext,
  CliDemoAgentObservedElement,
  CliDemoAgentPageObservation,
  CliDemoAgentPlanRequest,
} from "@/lib/clipstitchr/server/cli/demoAgentPlanner/CliDemoAgentPlanRequest";
import { readCliDemoAppContext } from "@/lib/clipstitchr/server/cli/appContext/readCliDemoAppContext";
import { readCliRequiredString } from "@/lib/clipstitchr/server/cli/readCliRequiredString";

const elementRoles = ["button", "heading", "input", "link", "dialog"] as const;

function readStringArray(value: unknown, maxItems: number, maxLength: number) {
  return Array.isArray(value)
    ? value
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim().slice(0, maxLength))
        .filter(Boolean)
        .slice(0, maxItems)
    : [];
}

function readObservedElements(value: unknown): CliDemoAgentObservedElement[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item): CliDemoAgentObservedElement | null => {
      if (!item || typeof item !== "object" || Array.isArray(item)) {
        return null;
      }

      const raw = item as Record<string, unknown>;
      const name = typeof raw.name === "string" ? raw.name.trim() : "";
      const role = elementRoles.find((candidate) => candidate === raw.role);

      if (!name || !role) {
        return null;
      }

      return {
        disabled: raw.disabled === true ? true : undefined,
        label:
          typeof raw.label === "string"
            ? raw.label.trim().slice(0, 160)
            : undefined,
        name: name.slice(0, 160),
        placeholder:
          typeof raw.placeholder === "string"
            ? raw.placeholder.trim().slice(0, 160)
            : undefined,
        role,
        selected: raw.selected === true ? true : undefined,
        value:
          typeof raw.value === "string"
            ? raw.value.trim().slice(0, 160)
            : undefined,
      };
    })
    .filter((item): item is CliDemoAgentObservedElement => Boolean(item))
    .slice(0, 50);
}

function readObservation(value: unknown): CliDemoAgentPageObservation {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Missing page observation.");
  }

  const raw = value as Record<string, unknown>;

  return {
    buttons: readObservedElements(raw.buttons),
    canScrollDown: raw.canScrollDown === true,
    canScrollUp: raw.canScrollUp === true,
    dialogs: readObservedElements(raw.dialogs),
    headings: readObservedElements(raw.headings),
    inputs: readObservedElements(raw.inputs),
    links: readObservedElements(raw.links),
    title: readCliRequiredString(raw, "title", "page title").slice(0, 240),
    url: readCliRequiredString(raw, "url", "page URL").slice(0, 500),
  };
}

function readGuideContext(value: unknown): CliDemoAgentGuideContext | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return undefined;
  }

  const raw = value as Record<string, unknown>;
  const title = typeof raw.title === "string" ? raw.title.trim() : "";
  const goal = typeof raw.goal === "string" ? raw.goal.trim() : "";

  if (!title || !goal) {
    return undefined;
  }

  return {
    goal: goal.slice(0, 500),
    productId:
      typeof raw.productId === "string"
        ? raw.productId.trim().slice(0, 120)
        : undefined,
    productName:
      typeof raw.productName === "string"
        ? raw.productName.trim().slice(0, 160)
        : undefined,
    steps: Array.isArray(raw.steps)
      ? raw.steps
          .map((item) => {
            if (!item || typeof item !== "object" || Array.isArray(item)) {
              return null;
            }

            const step = item as Record<string, unknown>;
            const id = typeof step.id === "string" ? step.id.trim() : "";
            const label =
              typeof step.label === "string" ? step.label.trim() : "";

            if (!id || !label) {
              return null;
            }

            return {
              id: id.slice(0, 120),
              label: label.slice(0, 240),
              ...(typeof step.notes === "string" && step.notes.trim()
                ? { notes: step.notes.trim().slice(0, 500) }
                : {}),
            };
          })
          .filter((item): item is CliDemoAgentGuideContext["steps"][number] =>
            Boolean(item),
          )
          .slice(0, 12)
      : [],
    title: title.slice(0, 240),
  };
}

export function readCliDemoAgentPlanRequest(
  body: Record<string, unknown>,
): CliDemoAgentPlanRequest {
  const rawStep = body.step;

  if (!rawStep || typeof rawStep !== "object" || Array.isArray(rawStep)) {
    throw new Error("Missing guide step.");
  }

  const step = rawStep as Record<string, unknown>;

  return {
    appContext: readCliDemoAppContext(body.appContext),
    approvedTestValueKeys: readStringArray(
      body.approvedTestValueKeys,
      50,
      120,
    ),
    approvedUploadFileKeys: readStringArray(
      body.approvedUploadFileKeys,
      50,
      180,
    ),
    attemptedActionKeys: readStringArray(body.attemptedActionKeys, 20, 240),
    guide: readGuideContext(body.guide),
    observation: readObservation(body.observation),
    step: {
      id: readCliRequiredString(step, "id", "step ID").slice(0, 120),
      label: readCliRequiredString(step, "label", "step label").slice(0, 240),
      notes:
        typeof step.notes === "string"
          ? step.notes.trim().slice(0, 500)
          : undefined,
    },
  };
}
