/**
 * Parser de CSV propio (`src/lib/csv.js`) y el mapeo de la matriz a filas de
 * eventos (`filasDesdeCsv`).
 *
 * Los casos salen de lo que realmente exporta Google Sheets: BOM, CRLF,
 * comillas, comas y saltos de linea dentro de una celda.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

import { parseCsv } from "../src/lib/csv.js";
import { filasDesdeCsv, parseEventRows } from "../src/lib/events-parse.js";

test("CSV simple, con CRLF y con salto final", () => {
  assert.deepEqual(parseCsv("a,b\nc,d"), [["a", "b"], ["c", "d"]]);
  assert.deepEqual(parseCsv("a,b\r\nc,d\r\n"), [["a", "b"], ["c", "d"]]);
  assert.deepEqual(parseCsv("a,b\rc,d"), [["a", "b"], ["c", "d"]]);
});

test("el BOM del export de Google no se pega al primer encabezado", () => {
  assert.deepEqual(parseCsv("﻿Título,Hora\nRecital,21:00"), [
    ["Título", "Hora"],
    ["Recital", "21:00"],
  ]);
});

test("comillas: comas, saltos de linea y comillas escapadas dentro del campo", () => {
  assert.deepEqual(parseCsv('"uno, dos",tres'), [["uno, dos", "tres"]]);
  assert.deepEqual(parseCsv('"linea 1\nlinea 2",x'), [["linea 1\nlinea 2", "x"]]);
  assert.deepEqual(parseCsv('"dijo ""hola""",x'), [['dijo "hola"', "x"]]);
  assert.deepEqual(parseCsv('"sin cerrar'), [["sin cerrar"]]);
});

test("celdas vacias se conservan; las lineas vacias se descartan", () => {
  assert.deepEqual(parseCsv("a,,c"), [["a", "", "c"]]);
  assert.deepEqual(parseCsv("a,b\n\nc,d"), [["a", "b"], ["c", "d"]]);
  assert.deepEqual(parseCsv(",,"), [["", "", ""]]);
  assert.deepEqual(parseCsv(""), []);
  assert.deepEqual(parseCsv("\n\n"), []);
  assert.deepEqual(parseCsv(null), []);
});

// ------------------------------------------------------------- filasDesdeCsv

test("filasDesdeCsv ubica las columnas por nombre y numera como Google Sheets", () => {
  const filas = filasDesdeCsv(
    parseCsv("Título,Descripción,Día,Hora,Banner,Activo\nRecital,Vamos y volvemos.,14/11/2026,21:00,,SI"),
  );
  assert.equal(filas.length, 1);
  assert.deepEqual(filas[0], {
    fila: 2, // la 1 son los encabezados
    titulo: "Recital",
    descripcion: "Vamos y volvemos.",
    dia: "14/11/2026",
    hora: "21:00",
    banner: "",
    activo: "SI",
  });
});

test("filasDesdeCsv tolera columnas reordenadas y una columna de mas", () => {
  const filas = filasDesdeCsv(
    parseCsv("Dia,Titulo,Descripcion,Notas internas,Activo\n14/11/2026,Recital,Vamos.,ojo con el peaje,SI"),
  );
  assert.equal(filas[0].titulo, "Recital");
  assert.equal(filas[0].dia, "14/11/2026");
  assert.equal(filas[0].hora, ""); // la hoja no trae la columna Hora
  assert.equal(filas[0].activo, "SI");
});

test("sin encabezados se usan las columnas por posicion, desde la fila 1", () => {
  const filas = filasDesdeCsv(parseCsv("Recital,Vamos y volvemos.,14/11/2026,21:00,,SI"));
  assert.equal(filas.length, 1);
  assert.equal(filas[0].fila, 1);
  assert.equal(filas[0].titulo, "Recital");
});

test("filasDesdeCsv con una matriz vacia", () => {
  assert.deepEqual(filasDesdeCsv([]), []);
  assert.deepEqual(filasDesdeCsv(null), []);
  // Solo los encabezados: la hoja esta cargada pero sin eventos.
  assert.deepEqual(filasDesdeCsv(parseCsv("Título,Descripción,Día,Hora,Banner,Activo\n")), []);
});

// --------------------------------------------------- CSV completo -> eventos

test("de un CSV con comillas y saltos de linea a eventos publicables", () => {
  const csv = [
    "Título,Descripción,Día,Hora,Banner,Activo",
    '"Recital en la Plaza del Agua","Te llevamos, te esperamos y te traemos.\nSalidas desde el centro.",14/11/2026,21:00,,SI',
    "Fiesta del Mar,Traslados para grupos.,09/01/2027,,,",
    "No publicar,Esta no va.,20/01/2027,,,NO",
  ].join("\r\n");

  const { events, errors } = parseEventRows(filasDesdeCsv(parseCsv(csv)));
  assert.deepEqual(errors, []);
  assert.deepEqual(events, [
    {
      title: "Recital en la Plaza del Agua",
      description: "Te llevamos, te esperamos y te traemos.\nSalidas desde el centro.",
      date: "2026-11-14",
      time: "21:00",
    },
    { title: "Fiesta del Mar", description: "Traslados para grupos.", date: "2027-01-09" },
  ]);
});

test("una fila invalida no arrastra a las demas: se publica el resto", () => {
  const csv = [
    "Título,Descripción,Día,Hora,Banner,Activo",
    "Sin fecha,Falta el dia.,el sabado,,,SI",
    "Fiesta del Mar,Traslados para grupos.,09/01/2027,,,SI",
  ].join("\n");

  const { events, errors } = parseEventRows(filasDesdeCsv(parseCsv(csv)));
  assert.equal(events.length, 1);
  assert.equal(events[0].title, "Fiesta del Mar");
  assert.equal(errors.length, 1);
  assert.match(errors[0], /^Fila 2: el Día "el sabado" no es una fecha valida/);
});

test("la plantilla CSV del repo se puede importar a Sheets y no publica nada", async () => {
  const texto = await readFile(
    fileURLToPath(new URL("../data/eventos-google-sheets.csv", import.meta.url)),
    "utf8",
  );
  const matriz = parseCsv(texto);
  assert.deepEqual(matriz[0], ["Título", "Descripción", "Día", "Hora", "Banner", "Activo"]);

  const { events, errors } = parseEventRows(filasDesdeCsv(matriz), { bannerExiste: () => true });
  assert.deepEqual(errors, []);
  // Todas las filas de ejemplo van con Activo = NO.
  assert.deepEqual(events, []);
});
