#!/usr/bin/env bash

set -euo pipefail

root_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
brand_dir="$root_dir/public/brand/v2"
app_dir="$root_dir/app"
og_dir="$root_dir/public/og/v2"
source_path="${1:-$brand_dir/source.png}"
work_dir="$(mktemp -d)"

cleanup() {
  rm -rf "$work_dir"
}

trap cleanup EXIT

if ! command -v magick >/dev/null 2>&1; then
  echo "ImageMagick is required. Install it and run this script again." >&2
  exit 1
fi

if [[ ! -f "$source_path" ]]; then
  echo "Brand source not found: $source_path" >&2
  exit 1
fi

mkdir -p "$brand_dir" "$og_dir"

transparent_source="$brand_dir/icon-transparent-source.png"
safe_master="$work_dir/icon-safe-master.png"
favicon_master="$work_dir/icon-favicon-master.png"
lockup_mark="$work_dir/lockup-mark.png"
favicon_outline_color="#100e0d"

magick "$source_path" \
  -alpha on \
  -bordercolor white \
  -border 1 \
  -fuzz 4% \
  -fill none \
  -draw "color 0,0 floodfill" \
  -shave 1x1 \
  -strip \
  "$transparent_source"

magick "$transparent_source" \
  -trim \
  +repage \
  -bordercolor none \
  -border 48 \
  -set option:square "%[fx:max(w,h)]" \
  -gravity center \
  -background none \
  -extent "%[square]x%[square]" \
  "$safe_master"

magick "$transparent_source" \
  -trim \
  +repage \
  -bordercolor none \
  -border 64 \
  -set option:square "%[fx:max(w,h)]" \
  -gravity center \
  -background none \
  -extent "%[square]x%[square]" \
  "$favicon_master"

for size in 64 128 180 192 256 512 1024; do
  magick "$safe_master" \
    -filter Lanczos \
    -resize "${size}x${size}" \
    -depth 8 \
    -strip \
    "$brand_dir/icon-${size}.png"
done

for size in 16 32 48; do
  case "$size" in
    16) outline_radius=1 ;;
    32 | 48) outline_radius=2 ;;
  esac

  favicon_foreground="$work_dir/favicon-foreground-${size}.png"
  canvas_padding="$((outline_radius + 1))"
  inner_size="$((size - canvas_padding * 2))"

  magick "$favicon_master" \
    -filter Lanczos \
    -resize "${inner_size}x${inner_size}" \
    -bordercolor none \
    -border "$canvas_padding" \
    -depth 8 \
    -strip \
    "$favicon_foreground"

  magick \
    \( "$favicon_foreground" \
      -channel A \
      -morphology Dilate "Disk:${outline_radius}" \
      +channel \
      -fill "$favicon_outline_color" \
      -colorize 100 \
    \) \
    "$favicon_foreground" \
    -compose over \
    -composite \
    -depth 8 \
    -strip \
    "$brand_dir/icon-${size}.png"
done

magick \
  "$brand_dir/icon-16.png" \
  "$brand_dir/icon-32.png" \
  "$brand_dir/icon-48.png" \
  "$brand_dir/favicon.ico"

magick -size 512x512 "xc:#100e0d" \
  \( "$transparent_source" -trim +repage -filter Lanczos -resize 380x380 \) \
  -gravity center \
  -compose over \
  -composite \
  -depth 8 \
  -strip \
  "$brand_dir/icon-maskable-512.png"

magick "$brand_dir/icon-maskable-512.png" \
  -filter Lanczos \
  -resize 192x192 \
  -depth 8 \
  -strip \
  "$brand_dir/icon-maskable-192.png"

magick "$brand_dir/icon-maskable-512.png" \
  -filter Lanczos \
  -resize 180x180 \
  -depth 8 \
  -strip \
  "$brand_dir/apple-touch-icon-180.png"

magick "$transparent_source" \
  -trim \
  +repage \
  -filter Lanczos \
  -resize x550 \
  "$lockup_mark"

mark_width="$(magick identify -format "%w" "$lockup_mark")"
text_x="$((21 + mark_width + 55))"
lockup_width="$((text_x + 1827 + 21))"

build_lockup() {
  local text_source="$1"
  local output_path="$2"

  magick -size "${lockup_width}x588" xc:none \
    "$lockup_mark" -geometry +21+19 -compose over -composite \
    "$text_source" -geometry "+${text_x}+73" -compose over -composite \
    -depth 8 \
    -strip \
    "$output_path"
}

build_lockup "$brand_dir/text-dark.png" "$brand_dir/logo-dark.png"
build_lockup "$brand_dir/text.png" "$brand_dir/logo.png"

magick -size 1200x630 "xc:#100e0d" \
  \( "$brand_dir/logo-dark.png" -filter Lanczos -resize 930x \) \
  -gravity center \
  -compose over \
  -composite \
  -depth 8 \
  -strip \
  "$og_dir/default.png"

cp "$brand_dir/icon-512.png" "$app_dir/icon.png"
cp "$brand_dir/icon-512.png" "$app_dir/icon-dark.png"
cp "$brand_dir/apple-touch-icon-180.png" "$app_dir/apple-icon.png"
cp "$brand_dir/favicon.ico" "$app_dir/favicon.ico"
cp "$brand_dir/favicon.ico" "$root_dir/public/favicon.ico"
cp "$brand_dir/apple-touch-icon-180.png" "$root_dir/public/apple-touch-icon.png"

echo "Built ClipStitchr brand v2 assets from $source_path"
