import { cliprHookStyles } from "@/lib/clipstitchr/resources/cliprHookStyles";
import { cliprHookTemplates } from "@/lib/clipstitchr/resources/cliprHookTemplates";

function getRandomItem<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)];
}

export function selectRandomCliprHookResource() {
  const style = getRandomItem(cliprHookStyles);
  const styleTemplates = cliprHookTemplates.filter(
    (template) => template.styleKey === style.styleKey,
  );
  const template = getRandomItem(
    styleTemplates.length ? styleTemplates : cliprHookTemplates,
  );

  return {
    style,
    template,
  };
}
