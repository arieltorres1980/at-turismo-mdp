/**
 * Genera `data/eventos.xlsx`: la planilla que usa el dueño del negocio para
 * cargar los proximos eventos.
 *
 * Se corre UNA sola vez (o cuando haya que regenerar la planilla desde cero)
 * con `npm run eventos:plantilla`. OJO: sobrescribe el archivo, asi que pisa
 * los eventos cargados. El que publica eventos no necesita este script.
 *
 * La planilla tiene dos hojas:
 *   - "Eventos": los datos. Encabezados fijos, formato de fecha y de hora,
 *     y validacion de datos en Día / Hora / Activo.
 *   - "Instrucciones": como completarla, en castellano y sin jerga.
 *
 * Las dos filas de ejemplo van con Activo = NO: `scripts/build-events.mjs` las
 * ignora, asi que estan a la vista como modelo pero NO se publican.
 */
import { createRequire } from "node:module";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import { CARPETA_BANNERS, COLUMNAS, EXTENSIONES_BANNER, MAX_DESCRIPCION, MAX_TITULO } from "./lib/parse-events.mjs";

const require = createRequire(import.meta.url);
const ExcelJS = require("exceljs");

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SALIDA = path.join(RAIZ, "data", "eventos.xlsx");

/** Hasta que fila se extienden los formatos y la validacion de datos. */
const ULTIMA_FILA = 200;

const NAVY = "FF0A2A6E";
const BLANCO = "FFFFFFFF";
const SUAVE = "FFF2F6FC";

const INSTRUCCIONES = [
  ["Cómo cargar los próximos eventos", "titulo"],
  ["", ""],
  ["1) Abrí la hoja \"Eventos\" (abajo a la izquierda) y completá una fila por evento.", ""],
  ["2) Si el evento tiene un banner (una imagen), copiá el archivo de imagen en la carpeta", ""],
  [`   public/${CARPETA_BANNERS}/ del proyecto y escribí en la columna "Banner" el nombre exacto`, ""],
  ["   del archivo, por ejemplo: recital.jpg", ""],
  ["3) Guardá la planilla (Ctrl + S) y cerrala.", ""],
  ["4) Subí el cambio al sitio (ver el README del proyecto: git push + vercel deploy --prod).", ""],
  ["", ""],
  ["Qué significa cada columna", "subtitulo"],
  ["", ""],
  ["Título — OBLIGATORIO. El nombre del evento, como se va a ver en la web.", ""],
  [`         Máximo ${MAX_TITULO} caracteres.`, ""],
  ["Descripción — OBLIGATORIA. Dos o tres líneas contando de qué se trata y qué ofrecemos.", ""],
  [`         Máximo ${MAX_DESCRIPCION} caracteres.`, ""],
  ["Día — OBLIGATORIO. La fecha del evento, en formato DD/MM/AAAA (por ejemplo 14/11/2026).", ""],
  ["Hora — OPCIONAL. En formato HH:MM, de 00:00 a 23:59 (por ejemplo 21:00).", ""],
  ["         Si lo dejás vacío, la tarjeta no muestra horario.", ""],
  [`Banner — OPCIONAL. Nombre del archivo de imagen que ya copiaste en public/${CARPETA_BANNERS}/.`, ""],
  [`         Se admiten: ${EXTENSIONES_BANNER.join(", ")}. Si lo dejás vacío, la tarjeta`, ""],
  ["         muestra un fondo con los colores de la marca.", ""],
  ["Activo — OPCIONAL. SI publica el evento, NO lo deja guardado sin publicar.", ""],
  ["         Si la celda está vacía se considera SI.", ""],
  ["", ""],
  ["Cosas importantes", "subtitulo"],
  ["", ""],
  ["• Los eventos cuyo día ya pasó se dejan de mostrar solos. Igual conviene borrar las filas", ""],
  ["  viejas de vez en cuando para que la planilla no crezca sin control.", ""],
  ["• Si no hay ningún evento próximo, la sección entera desaparece de la web: no queda un", ""],
  ["  título vacío ni un link que no lleva a nada.", ""],
  ["• No cambies los nombres ni el orden de los encabezados de la hoja \"Eventos\": el sitio los", ""],
  ["  lee por posición y dejaría de encontrar los datos.", ""],
  ["• No borres ni renombres la hoja \"Eventos\".", ""],
  ["• Las dos filas de EJEMPLO de la hoja \"Eventos\" tienen Activo = NO, así que no se publican.", ""],
  ["  Podés dejarlas como modelo o borrarlas; si alguna vez las querés publicar, primero", ""],
  ["  cambiá Activo a SI y copiá el banner correspondiente.", ""],
  ["• Si algún dato obligatorio falta o está mal escrito, la publicación se detiene y avisa el", ""],
  ["  número de fila con el problema. Nada roto llega a la web.", ""],
];

async function main() {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "AT Turismo y Traslados";
  workbook.description = "Próximos eventos publicados en www.attrasladosmdp.com.ar";
  // Fecha fija: el archivo generado tiene que ser reproducible y no ensuciar el
  // diff de git cada vez que se regenera.
  workbook.created = new Date(Date.UTC(2026, 0, 1));
  workbook.modified = workbook.created;

  // ------------------------------------------------------------ Instrucciones
  const guia = workbook.addWorksheet("Instrucciones", {
    views: [{ showGridLines: false }],
  });
  guia.getColumn(1).width = 104;

  INSTRUCCIONES.forEach(([texto, tipo], i) => {
    const row = guia.getRow(i + 1);
    row.getCell(1).value = texto;
    if (tipo === "titulo") {
      row.getCell(1).font = { bold: true, size: 16, color: { argb: NAVY } };
      row.height = 26;
    } else if (tipo === "subtitulo") {
      row.getCell(1).font = { bold: true, size: 12, color: { argb: NAVY } };
      row.height = 20;
    } else {
      row.getCell(1).font = { size: 11 };
    }
  });

  // ------------------------------------------------------------------ Eventos
  const hoja = workbook.addWorksheet("Eventos", {
    views: [{ state: "frozen", ySplit: 1 }],
  });

  hoja.columns = [
    { header: COLUMNAS[0], key: "titulo", width: 34 },
    { header: COLUMNAS[1], key: "descripcion", width: 62 },
    { header: COLUMNAS[2], key: "dia", width: 14 },
    { header: COLUMNAS[3], key: "hora", width: 10 },
    { header: COLUMNAS[4], key: "banner", width: 24 },
    { header: COLUMNAS[5], key: "activo", width: 10 },
  ];

  const encabezado = hoja.getRow(1);
  encabezado.height = 24;
  encabezado.font = { bold: true, color: { argb: BLANCO } };
  encabezado.alignment = { vertical: "middle" };
  for (let c = 1; c <= COLUMNAS.length; c += 1) {
    encabezado.getCell(c).fill = { type: "pattern", pattern: "solid", fgColor: { argb: NAVY } };
  }
  encabezado.getCell(1).note = "Obligatorio. Nombre del evento.";
  encabezado.getCell(2).note = "Obligatoria. Dos o tres líneas sobre el evento.";
  encabezado.getCell(3).note = "Obligatorio. Formato DD/MM/AAAA.";
  encabezado.getCell(4).note = "Opcional. Formato HH:MM (24 horas).";
  encabezado.getCell(5).note = `Opcional. Nombre del archivo que copiaste en public/${CARPETA_BANNERS}/.`;
  encabezado.getCell(6).note = "Opcional. SI publica el evento, NO lo guarda sin publicar. Vacío = SI.";

  // Filas de ejemplo: Activo = NO, nunca se publican.
  hoja.addRow({
    titulo: "EJEMPLO — Recital en la Plaza del Agua",
    descripcion:
      "EJEMPLO (no se publica). Te llevamos y te buscamos a la salida, sin preocuparte por estacionar. Coordinamos el punto de encuentro por WhatsApp.",
    dia: new Date(Date.UTC(2026, 10, 14)),
    hora: "21:00",
    banner: "",
    activo: "NO",
  });
  hoja.addRow({
    titulo: "EJEMPLO — Fiesta Nacional del Mar",
    descripcion:
      "EJEMPLO (no se publica). Traslados para grupos desde cualquier punto de Mar del Plata, con regreso coordinado.",
    dia: new Date(Date.UTC(2027, 0, 9)),
    hora: "",
    banner: "",
    activo: "NO",
  });

  for (let f = 2; f <= ULTIMA_FILA; f += 1) {
    const row = hoja.getRow(f);
    row.getCell(1).alignment = { vertical: "top", wrapText: true };
    row.getCell(2).alignment = { vertical: "top", wrapText: true };

    const dia = row.getCell(3);
    dia.numFmt = "dd/mm/yyyy";
    dia.alignment = { vertical: "top", horizontal: "center" };
    dia.dataValidation = {
      type: "date",
      operator: "greaterThan",
      allowBlank: true,
      showErrorMessage: true,
      formulae: [new Date(Date.UTC(2020, 0, 1))],
      errorStyle: "stop",
      errorTitle: "Fecha invalida",
      error: "Escribí la fecha del evento en formato DD/MM/AAAA, por ejemplo 14/11/2026.",
    };

    const hora = row.getCell(4);
    hora.numFmt = "hh:mm";
    hora.alignment = { vertical: "top", horizontal: "center" };

    row.getCell(5).alignment = { vertical: "top" };

    const activo = row.getCell(6);
    activo.alignment = { vertical: "top", horizontal: "center" };
    activo.dataValidation = {
      type: "list",
      allowBlank: true,
      showErrorMessage: true,
      formulae: ['"SI,NO"'],
      errorStyle: "stop",
      errorTitle: "Valor invalido",
      error: "Elegí SI para publicar el evento o NO para dejarlo guardado sin publicar.",
    };

    if (f % 2 === 0) {
      for (let c = 1; c <= COLUMNAS.length; c += 1) {
        row.getCell(c).fill = { type: "pattern", pattern: "solid", fgColor: { argb: SUAVE } };
      }
    }
  }

  await mkdir(path.dirname(SALIDA), { recursive: true });
  await workbook.xlsx.writeFile(SALIDA);
  process.stdout.write(`[eventos] plantilla generada en ${path.relative(RAIZ, SALIDA)}\n`);
}

await main();
