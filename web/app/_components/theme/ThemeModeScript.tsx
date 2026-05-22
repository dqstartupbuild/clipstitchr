import Script from "next/script";
import { themeModeStorageKey } from "@/lib/clipstitchr/theme/themeModeStorageKey";

const themeModeScript = `
(function () {
  try {
    var storedThemeMode = window.localStorage.getItem(${JSON.stringify(themeModeStorageKey)});
    var themeMode = storedThemeMode === "light" || storedThemeMode === "dark"
      ? storedThemeMode
      : "system";
    var root = document.documentElement;

    root.dataset.themeMode = themeMode;

    if (themeMode === "system") {
      root.removeAttribute("data-theme");
      return;
    }

    root.dataset.theme = themeMode;
  } catch (error) {}
})();
`;

export function ThemeModeScript() {
  return (
    <Script
      id="clipstitchr-theme-mode"
      strategy="beforeInteractive"
      dangerouslySetInnerHTML={{ __html: themeModeScript }}
    />
  );
}
