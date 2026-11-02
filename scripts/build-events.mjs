/**
 * Lee `data/eventos.xlsx` y genera `src/data/events.json`.
 *
 * Corre solo y antes del build (`prebuild` en package.json) y a mano con
 * `npm run eventos`. Si la planilla tiene un error, el proceso termina con
 * codigo 1 y un mensaje con el numero de fila: el deploy se corta antes de
 * publicar un evento roto.
 *
 * El JSON generado se commitea igual que cualquier otro archivo de `src/data/`:
 * asi el sitio se puede buildear incluso si alguien borra la planilla, y el
 * diff del commit muestra que evento se publico.
 */
import { createRequire } from "node:module";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import { CARPETA_BANNERS, COLUMNAS, parseEventRows } from "./lib/parse-events.mjs";

const require = createRequire(import.meta.url);
const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PLANILLA = path.join(RAIZ, "data", "eventos.xlsx");
const SALIDA = path.join(RAIZ, "src", "data", "events.json");
const BANNERS = path.join(RAIZ, "public", CARPETA_BANNERS);
const HOJA = "Eventos";

function fallar(mensaje) {
  process.stderr.write(`\n[eventos] ERROR: ${mensaje}\n\n`);
  process.exit(1);
}

/** Celdas de la fila, en el orden de COLUMNAS. */
function leerFila(row) {
  const celda = (i) => {
    const value = row.getCell(i).value;
    return value === undefined ? null : value;
  };
  return {
    fila: row.number,
    titulo: celda(1),
    descripcion: celda(2),
    dia: celda(3),
    hora: celda(4),
    banner: celda(5),
    activo: celda(6),
  };
}

async function main() {
  if (!existsSync(PLANILLA)) {
    fallar(
      `no encuentro la planilla en ${path.relative(RAIZ, PLANILLA)}.\n` +
        "  Si la borraste, recuperala con `git checkout data/eventos.xlsx`\n" +
        "  o generá una nueva vacia con `npm run eventos:plantilla`.",
    );
  }

  // ExcelJS se carga con require() porque su ESM es un wrapper del CJS y asi
  // se evita depender de la forma del default export.
  const ExcelJS = require("exceljs");
  const workbook = new ExcelJS.Workbook();
  try {
    await workbook.xlsx.readFile(PLANILLA);
  } catch (error) {
    fallar(
      `no pude leer ${path.relative(RAIZ, PLANILLA)}: ${error.message}\n` +
        "  Revisá que sea un archivo .xlsx (Excel) y que no esté abierto en otro programa.",
    );
  }

  const hoja = workbook.getWorksheet(HOJA) ?? workbook.worksheets[0];
  if (!hoja) {
    fallar(`la planilla no tiene ninguna hoja. Esperaba una hoja "${HOJA}".`);
  }

  const filas = [];
  hoja.eachRow({ includeEmpty: false }, (row) => {
    if (row.number === 1) return; // encabezados
    filas.push(leerFila(row));
  });

  const { events, errors } = parseEventRows(filas, {
    bannerExiste: (nombre) => existsSync(path.join(BANNERS, nombre)),
  });

  if (errors.length > 0) {
    fallar(
      `la planilla data/eventos.xlsx tiene ${errors.length} problema(s) en la hoja "${HOJA}":\n` +
        errors.map((e) => `  - ${e}`).join("\n") +
        "\n\n  Corregí la planilla, guardala y volvé a correr `npm run eventos`." +
        `\n  Columnas esperadas, en orden: ${COLUMNAS.join(" | ")}.`,
    );
  }

  const json = `${JSON.stringify(events, null, 2)}\n`;
  const anterior = await readFile(SALIDA, "utf8").catch(() => null);

  if (anterior === json) {
    process.stdout.write(`[eventos] sin cambios: ${events.length} evento(s) en src/data/events.json\n`);
    return;
  }

  await mkdir(path.dirname(SALIDA), { recursive: true });
  await writeFile(SALIDA, json, "utf8");
  process.stdout.write(
    `[eventos] src/data/events.json actualizado: ${events.length} evento(s) publicado(s).\n`,
  );
}

await main();
