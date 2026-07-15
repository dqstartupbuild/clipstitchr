const cacheVersion = "2.2";

function versionedAsset(pathname: string) {
  return `${pathname}?v=${cacheVersion}`;
}

export const brandAssets = {
  cacheVersion,
  logoOnDark: versionedAsset("/brand/v2/logo-dark.png"),
  logoOnLight: versionedAsset("/brand/v2/logo.png"),
  icon16: versionedAsset("/brand/v2/icon-16.png"),
  icon32: versionedAsset("/brand/v2/icon-32.png"),
  icon48: versionedAsset("/brand/v2/icon-48.png"),
  icon64: versionedAsset("/brand/v2/icon-64.png"),
  icon128: versionedAsset("/brand/v2/icon-128.png"),
  icon180: versionedAsset("/brand/v2/icon-180.png"),
  icon192: versionedAsset("/brand/v2/icon-192.png"),
  icon256: versionedAsset("/brand/v2/icon-256.png"),
  icon512: versionedAsset("/brand/v2/icon-512.png"),
  icon1024: versionedAsset("/brand/v2/icon-1024.png"),
  maskableIcon192: versionedAsset("/brand/v2/icon-maskable-192.png"),
  maskableIcon512: versionedAsset("/brand/v2/icon-maskable-512.png"),
  appleTouchIcon: versionedAsset("/brand/v2/apple-touch-icon-180.png"),
  favicon: versionedAsset("/brand/v2/favicon.ico"),
  openGraphDefault: versionedAsset("/og/v2/default.png"),
} as const;
