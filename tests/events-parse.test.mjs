/**
 * Parseo y validacion de `data/eventos.xlsx`.
 *
 * La mayoria de los casos usan las funciones puras con valores crudos (sin
 * tocar Excel). Al final hay UN test de integracion que escribe un .xlsx
 * temporal con ExcelJS y lo vuelve a leer, para verificar que lo que ExcelJS
 * devuelve para una celda fecha y una celda hora es lo que el parser espera.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  MAX_DESCRIPCION,
  MAX_TITULO,
  cellText,
  parseActivo,
  parseBanner,
  parseDia,
  parseEventRows,
  parseHora,
} from "../scripts/lib/parse-events.mjs";

const require = createRequire(import.meta.url);

const fila = (overrides = {}) => ({
  fila: 2,
  titulo: "Recital en la Plaza del Agua",
  descripcion: "Te llevamos y te buscamos a la salida.",
  dia: "14/11/2026",
  hora: "21:00",
  banner: "",
  activo: "",
  ...overrides,
});

const parse = (filas, options) => parseEventRows(filas, options);

// ------------------------------------------------------------------ cellText

test("cellText aplana los tipos que devuelve ExcelJS", () => {
  assert.equal(cellText(null), "");
  assert.equal(cellText(undefined), "");
  assert.equal(cellText("  hola  "), "hola");
  assert.equal(cellText(42), "42");
  assert.equal(cellText({ richText: [{ text: "Fiesta " }, { text: "del Mar" }] }), "Fiesta del Mar");
  assert.equal(cellText({ formula: "A1", result: "Recital" }), "Recital");
  assert.equal(cellText({ text: "link", hyperlink: "https://x" }), "link");
  assert.equal(cellText({ error: "#REF!" }), "");
});

// -------------------------------------------------------------------- parseDia

test("parseDia acepta texto DD/MM/AAAA, DD-MM-AAAA y AAAA-MM-DD", () => {
  assert.equal(parseDia("14/11/2026"), "2026-11-14");
  assert.equal(parseDia("4/1/2027"), "2027-01-04");
  assert.equal(parseDia("14-11-2026"), "2026-11-14");
  assert.equal(parseDia("2026-11-14"), "2026-11-14");
});

test("parseDia acepta celdas fecha de Excel (Date en UTC) y el serial", () => {
  assert.equal(parseDia(new Date(Date.UTC(2026, 10, 14))), "2026-11-14");
  // 46340 = 14/11/2026 en el calendario de Excel.
  assert.equal(parseDia(46340), "2026-11-14");
});

test("parseDia acepta MM/DD/AAAA cuando el dia no puede ser un mes (export de Sheets en ingles)", () => {
  assert.equal(parseDia("11/14/2026"), "2026-11-14");
  assert.equal(parseDia("1/31/2027"), "2027-01-31");
  // Si los dos numeros pueden ser mes, manda DD/MM/AAAA (lo que pide la planilla).
  assert.equal(parseDia("03/04/2027"), "2027-04-03");
});

test("parseDia rechaza fechas imposibles y basura", () => {
  assert.equal(parseDia("31/02/2026"), null);
  assert.equal(parseDia("29/02/2026"), null);
  assert.equal(parseDia("29/02/2028"), "2028-02-29");
  assert.equal(parseDia("14/13/2026"), null);
  assert.equal(parseDia("el sabado que viene"), null);
  assert.equal(parseDia(""), null);
  assert.equal(parseDia(new Date("nada")), null);
});

// ------------------------------------------------------------------- parseHora

test("parseHora: vacio es undefined (opcional), invalido es null", () => {
  assert.equal(parseHora(""), undefined);
  assert.equal(parseHora(null), undefined);
  assert.equal(parseHora("   "), undefined);
  assert.equal(parseHora("a la tarde"), null);
  assert.equal(parseHora("25:00"), null);
  assert.equal(parseHora("21:60"), null);
  assert.equal(parseHora("2100"), null);
});

test("parseHora normaliza texto, celdas hora de Excel y fracciones de dia", () => {
  assert.equal(parseHora("21:00"), "21:00");
  assert.equal(parseHora("9:05"), "09:05");
  assert.equal(parseHora("21:00:00"), "21:00");
  assert.equal(parseHora("00:00"), "00:00");
  assert.equal(parseHora("23:59"), "23:59");
  assert.equal(parseHora(new Date(Date.UTC(1899, 11, 30, 21, 30))), "21:30");
  assert.equal(parseHora(0.5), "12:00");
  assert.equal(parseHora(0.875), "21:00");
});

// ------------------------------------------------------- parseActivo / banner

test("Activo: vacio es SI, solo un NO explicito saca la fila", () => {
  assert.equal(parseActivo(""), true);
  assert.equal(parseActivo("SI"), true);
  assert.equal(parseActivo("Sí"), true);
  assert.equal(parseActivo("no"), false);
  assert.equal(parseActivo("NO"), false);
  assert.equal(parseActivo(false), false);
});

test("parseBanner exige un nombre de archivo simple con extension de imagen", () => {
  assert.deepEqual(parseBanner(""), { ok: true });
  assert.deepEqual(parseBanner("recital.jpg"), { ok: true, banner: "recital.jpg" });
  assert.deepEqual(parseBanner("Recital 2026.WEBP"), { ok: true, banner: "Recital 2026.WEBP" });
  assert.equal(parseBanner("fotos/recital.jpg").ok, false);
  assert.equal(parseBanner("../../secreto.jpg").ok, false);
  assert.equal(parseBanner("recital.pdf").ok, false);
  assert.equal(parseBanner("recital").ok, false);
});

// -------------------------------------------------------------- parseEventRows

test("hoja vacia -> ningun evento y ningun error", () => {
  const r = parse([]);
  assert.deepEqual(r.events, []);
  assert.deepEqual(r.errors, []);
});

test("las filas totalmente vacias se ignoran sin error", () => {
  const r = parse([{ fila: 5, titulo: "", descripcion: "", dia: null, hora: null, banner: "", activo: "" }]);
  assert.deepEqual(r.events, []);
  assert.deepEqual(r.errors, []);
});

test("el caso feliz normaliza el evento", () => {
  const r = parse([fila()]);
  assert.deepEqual(r.errors, []);
  assert.deepEqual(r.events, [
    {
      title: "Recital en la Plaza del Agua",
      description: "Te llevamos y te buscamos a la salida.",
      date: "2026-11-14",
      time: "21:00",
    },
  ]);
});

test("sin hora el evento no tiene la clave time; sin banner tampoco banner", () => {
  const [evento] = parse([fila({ hora: "" })]).events;
  assert.equal("time" in evento, false);
  assert.equal("banner" in evento, false);
});

test("una fila con Activo = NO se ignora entera, aunque este incompleta", () => {
  const r = parse([fila({ activo: "NO", titulo: "", dia: "fecha mal", banner: "no-existe.jpg" })]);
  assert.deepEqual(r.events, []);
  assert.deepEqual(r.errors, []);
});

test("una fila con Activo = SI pero sin ningun dato se ignora, no es error", () => {
  const r = parse([{ fila: 6, titulo: "", descripcion: "", dia: "", hora: "", banner: "", activo: "SI" }]);
  assert.deepEqual(r.events, []);
  assert.deepEqual(r.errors, []);
});

test("faltan los obligatorios: un error por problema, con el numero de fila", () => {
  // La fila tiene algo cargado (la hora), asi que no se puede ignorar: hay que
  // avisar que falta lo obligatorio.
  const r = parse([{ fila: 7, titulo: "", descripcion: "", dia: "", hora: "21:00", banner: "", activo: "SI" }]);
  assert.deepEqual(r.events, []);
  assert.equal(r.errors.length, 3);
  assert.ok(r.errors.every((e) => e.startsWith("Fila 7: ")));
  assert.ok(r.errors.some((e) => /Título/.test(e)));
  assert.ok(r.errors.some((e) => /Descripción/.test(e)));
  assert.ok(r.errors.some((e) => /Día/.test(e)));
});

test("fecha u hora invalidas son error y la fila no se publica", () => {
  const r = parse([fila({ fila: 3, dia: "32/01/2027" }), fila({ fila: 4, hora: "7 de la tarde" })]);
  assert.deepEqual(r.events, []);
  assert.ok(r.errors.some((e) => e.startsWith("Fila 3: ") && /no es una fecha valida/.test(e)));
  assert.ok(r.errors.some((e) => e.startsWith("Fila 4: ") && /Hora/.test(e)));
});

test("titulo o descripcion demasiado largos son error", () => {
  const r = parse([
    fila({ fila: 3, titulo: "x".repeat(MAX_TITULO + 1) }),
    fila({ fila: 4, descripcion: "x".repeat(MAX_DESCRIPCION + 1) }),
  ]);
  assert.deepEqual(r.events, []);
  assert.equal(r.errors.length, 2);
  assert.ok(parse([fila({ titulo: "x".repeat(MAX_TITULO) })]).errors.length === 0);
});

test("un banner que no existe en public/eventos/ es error con el nombre y la fila", () => {
  const r = parse([fila({ fila: 9, banner: "recital.jpg" })], { bannerExiste: () => false });
  assert.deepEqual(r.events, []);
  assert.equal(r.errors.length, 1);
  assert.match(r.errors[0], /^Fila 9: el banner "recital\.jpg" no existe en public\/eventos\//);
});

test("un banner que existe se conserva tal cual", () => {
  const r = parse([fila({ banner: "recital.jpg" })], {
    bannerExiste: (nombre) => nombre === "recital.jpg",
  });
  assert.deepEqual(r.errors, []);
  assert.equal(r.events[0].banner, "recital.jpg");
});

test("los eventos salen ordenados por fecha y, a igual fecha, por hora", () => {
  const r = parse([
    fila({ fila: 2, titulo: "C", dia: "20/12/2026", hora: "" }),
    fila({ fila: 3, titulo: "A", dia: "14/11/2026", hora: "22:00" }),
    fila({ fila: 4, titulo: "B", dia: "14/11/2026", hora: "09:00" }),
  ]);
  assert.deepEqual(r.errors, []);
  assert.deepEqual(
    r.events.map((e) => e.title),
    ["B", "A", "C"],
  );
});

// --------------------------------------------------------------- integracion

test("ida y vuelta real por un .xlsx escrito con ExcelJS", async () => {
  const ExcelJS = require("exceljs");
  const dir = await mkdtemp(path.join(tmpdir(), "eventos-test-"));
  const archivo = path.join(dir, "eventos.xlsx");

  try {
    const wb = new ExcelJS.Workbook();
    const hoja = wb.addWorksheet("Eventos");
    hoja.addRow(["Título", "Descripción", "Día", "Hora", "Banner", "Activo"]);

    const celdaDia = hoja.addRow(["Recital", "Vamos y volvemos.", new Date(Date.UTC(2026, 10, 14)), null, null, null]);
    celdaDia.getCell(3).numFmt = "dd/mm/yyyy";
    const celdaHora = hoja.getRow(2).getCell(4);
    celdaHora.value = new Date(Date.UTC(1899, 11, 30, 21, 30));
    celdaHora.numFmt = "hh:mm";

    hoja.addRow(["Ejemplo que no se publica", "", "", "", "", "NO"]);
    hoja.addRow(["Fiesta del Mar", "Traslados para grupos.", "09/01/2027", "", "", "SI"]);

    await wb.xlsx.writeFile(archivo);

    const leido = new ExcelJS.Workbook();
    await leido.xlsx.readFile(archivo);
    const hojaLeida = leido.getWorksheet("Eventos");

    const filas = [];
    hojaLeida.eachRow({ includeEmpty: false }, (row) => {
      if (row.number === 1) return;
      const celda = (i) => {
        const value = row.getCell(i).value;
        return value === undefined ? null : value;
      };
      filas.push({
        fila: row.number,
        titulo: celda(1),
        descripcion: celda(2),
        dia: celda(3),
        hora: celda(4),
        banner: celda(5),
        activo: celda(6),
      });
    });

    const r = parseEventRows(filas);
    assert.deepEqual(r.errors, []);
    assert.deepEqual(r.events, [
      { title: "Recital", description: "Vamos y volvemos.", date: "2026-11-14", time: "21:30" },
      { title: "Fiesta del Mar", description: "Traslados para grupos.", date: "2027-01-09" },
    ]);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("la planilla del repo se lee sin errores", async () => {
  const ExcelJS = require("exceljs");
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(fileURLToPath(new URL("../data/eventos.xlsx", import.meta.url)));

  const hoja = wb.getWorksheet("Eventos");
  assert.ok(hoja, 'la planilla tiene que tener una hoja "Eventos"');
  assert.ok(wb.getWorksheet("Instrucciones"), 'la planilla tiene que tener una hoja "Instrucciones"');
  assert.deepEqual(
    [1, 2, 3, 4, 5, 6].map((c) => cellText(hoja.getRow(1).getCell(c).value)),
    ["Título", "Descripción", "Día", "Hora", "Banner", "Activo"],
  );

  const filas = [];
  hoja.eachRow({ includeEmpty: false }, (row) => {
    if (row.number === 1) return;
    const celda = (i) => {
      const value = row.getCell(i).value;
      return value === undefined ? null : value;
    };
    filas.push({
      fila: row.number,
      titulo: celda(1),
      descripcion: celda(2),
      dia: celda(3),
      hora: celda(4),
      banner: celda(5),
      activo: celda(6),
    });
  });

  const r = parseEventRows(filas);
  assert.deepEqual(r.errors, []);
  // Las filas de ejemplo van con Activo = NO: la planilla del repo no publica nada.
  assert.deepEqual(r.events, []);
});
