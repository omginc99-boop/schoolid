// One-off icon generator for app-store submission (iOS/Android wrappers).
// Produces: a full-bleed "any" icon set + a padded "maskable" variant
// (maskable needs ~20% safe-zone padding so Android's adaptive-icon masks
// don't clip the content).
import sharp from "sharp";
import { readFileSync, mkdirSync } from "fs";
import path from "path";

const root = path.resolve(import.meta.dirname, "..");
const svgPath = path.join(root, "app", "icon.svg");
const outDir = path.join(root, "public", "icons");
mkdirSync(outDir, { recursive: true });

const svg = readFileSync(svgPath);
const BRAND_BG = "#4f46e5";

const anySizes = [1024, 512, 192, 180, 32, 16];
const maskableSizes = [1024, 512, 192];

async function genAny(size) {
  const out = path.join(outDir, `icon-${size}.png`);
  await sharp(svg, { density: 384 }).resize(size, size).png().toFile(out);
  console.log("wrote", out);
}

async function genMaskable(size) {
  const inner = Math.round(size * 0.7); // 70% content, ~15% padding each side
  const fg = await sharp(svg, { density: 384 }).resize(inner, inner).png().toBuffer();
  const out = path.join(outDir, `icon-maskable-${size}.png`);
  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: BRAND_BG,
    },
  })
    .composite([{ input: fg, gravity: "center" }])
    .png()
    .toFile(out);
  console.log("wrote", out);
}

for (const s of anySizes) await genAny(s);
for (const s of maskableSizes) await genMaskable(s);

// apple-touch-icon convention (used directly, no /icons/ prefix)
await sharp(svg, { density: 384 })
  .resize(180, 180)
  .flatten({ background: BRAND_BG }) // iOS ignores alpha and shows black otherwise
  .png()
  .toFile(path.join(root, "public", "apple-touch-icon.png"));
console.log("wrote apple-touch-icon.png");

console.log("Done.");
