/**
 * Genera los activos de marca a partir de public/brand/logo.jpg (E2).
 *
 *   node scripts/generate-brand-assets.mjs
 *
 * Usa `sharp`, que ya viene como dependencia opcional de Next (no se instala nada).
 * Es idempotente: siempre sobreescribe las mismas salidas. Los resultados se
 * commitean; el build no depende de sharp.
 *
 * Decision visual: el logo completo ("TURISMO Y TRASLADOS") es ilegible a 32 px,
 * asi que los iconos recortan corona + "A.T" + ola (franja y=100..430 del
 * original de 640x640) y la centran sobre negro.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const logoPath = resolve(root, "public/brand/logo.jpg");
const appDir = resolve(root, "src/app");

// El JPG no es negro puro (ruido de compresion): se muestrea la esquina para
// que el relleno no deje costuras visibles.
const { data } = await sharp(logoPath)
  .extract({ left: 0, top: 0, width: 4, height: 4 })
  .raw()
  .toBuffer({ resolveWithObject: true });
const bg = { r: data[0], g: data[1], b: data[2] };

const SRC = 640;
const STRIP_TOP = 100;
const STRIP_H = 330;
const pad = Math.floor((SRC - STRIP_H) / 2);

/** Recorte corona + A.T + ola, cuadrado, sobre el fondo del logo. */
const strip = await sharp(logoPath)
  .extract({ left: 0, top: STRIP_TOP, width: SRC, height: STRIP_H })
  .toBuffer();
const squareBuffer = await sharp(strip)
  .extend({ top: pad, bottom: SRC - STRIP_H - pad, background: bg })
  .toBuffer();
const squareIcon = () => sharp(squareBuffer);

await mkdir(appDir, { recursive: true });

await squareIcon().resize(512, 512).png({ compressionLevel: 9 }).toFile(resolve(appDir, "icon.png"));
await squareIcon().resize(180, 180).flatten({ background: bg }).png({ compressionLevel: 9 }).toFile(resolve(appDir, "apple-icon.png"));

// OG 1200x630: logo completo centrado sobre el negro del logo.
const ogLogo = await sharp(logoPath).resize(630, 630).toBuffer();
await sharp({ create: { width: 1200, height: 630, channels: 3, background: bg } })
  .composite([{ input: ogLogo, left: 285, top: 0 }])
  .jpeg({ quality: 85, mozjpeg: true })
  .toFile(resolve(appDir, "opengraph-image.jpg"));

await writeFile(
  resolve(appDir, "opengraph-image.alt.txt"),
  "Logo de AT Turismo y Viajes: corona dorada, letras A.T azules y una ola azul y dorada sobre fondo negro",
);

console.log("Activos generados en src/app (icon.png, apple-icon.png, opengraph-image.jpg, .alt.txt)");
