// Generates the app-store icon set from the designed raster source
// (scripts/source-assets/schoolid-icon-source.png), replacing the old
// SVG-rasterized set. Trims the outer navy canvas padding so the gradient
// square is full-bleed (the OS applies its own corner rounding), then
// exports the standard "any" sizes. The source already has generous
// internal margin around the glyph, so the same trimmed square is reused
// for "maskable" without extra synthetic padding.
import sharp from "sharp";
import { readFileSync, mkdirSync, copyFileSync } from "fs";
import path from "path";

const root = path.resolve(import.meta.dirname, "..");
const srcPath = path.join(root, "scripts", "source-assets", "schoolid-icon-source.png");
const outDir = path.join(root, "public", "icons");
mkdirSync(outDir, { recursive: true });

const BRAND_BG = "#4f46e5";

async function main() {
  const trimmed = await sharp(readFileSync(srcPath)).trim().toBuffer();
  const tMeta = await sharp(trimmed).metadata();
  console.log("trimmed to", tMeta.width, "x", tMeta.height);

  // The source's rounded corners are baked in, leaving background-color
  // slivers in the trimmed bounding box's corners. Crop further inward past
  // the curve so the result is a true edge-to-edge square with no baked-in
  // rounding -- both app stores' OSes apply their own corner mask on top.
  const side = Math.min(tMeta.width, tMeta.height);
  const inset = Math.round(side * 0.08);
  const cropSide = side - inset * 2;
  const left = Math.round((tMeta.width - cropSide) / 2);
  const top = Math.round((tMeta.height - cropSide) / 2);
  const squared = await sharp(trimmed)
    .extract({ left, top, width: cropSide, height: cropSide })
    .toBuffer();
  const meta = await sharp(squared).metadata();
  console.log("cropped to full-bleed square", meta.width, "x", meta.height);

  const sizes = [1024, 512, 192, 180, 32, 16];
  for (const size of sizes) {
    const out = path.join(outDir, `icon-${size}.png`);
    await sharp(squared).resize(size, size).png().toFile(out);
    console.log("wrote", out);
  }

  // Maskable: Android's adaptive-icon mask can crop to a circle, which would
  // clip the cap tip / card edges if the glyph ran full-bleed. Pad it down to
  // ~68% so everything survives the worst-case circular mask. The border is
  // filled by stretching the gradient's own edge pixels outward (not a flat
  // color) so there's no visible seam between the shrunk square and the pad.
  const maskableSizes = [1024, 512, 192];
  for (const size of maskableSizes) {
    const inner = Math.round(size * 0.68);
    const pad = Math.round((size - inner) / 2);
    const out = path.join(outDir, `icon-maskable-${size}.png`);
    await sharp(squared)
      .resize(inner, inner)
      .extend({ top: pad, bottom: pad, left: pad, right: pad, extendWith: "copy" })
      .resize(size, size)
      .png()
      .toFile(out);
    console.log("wrote", out);
  }

  await sharp(squared)
    .resize(180, 180)
    .flatten({ background: BRAND_BG })
    .png()
    .toFile(path.join(root, "public", "apple-touch-icon.png"));
  console.log("wrote apple-touch-icon.png");

  // Keep a full-res master next to the source for future re-exports / store listing uploads.
  await sharp(squared).png().toFile(path.join(root, "scripts", "source-assets", "schoolid-icon-trimmed-master.png"));

  console.log("Done.");
}

main();
