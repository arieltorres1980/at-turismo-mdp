/**
 * Runtime de la seccion "Próximos eventos": filtrado de pasados, formato de
 * fecha es-AR y navegacion condicional.
 */
import test from "node:test";
import assert from "node:assert/strict";

import events from "../src/data/events.json" with { type: "json" };
import { dateTimeAttr, formatearFechaEvento, proximosEventos } from "../src/lib/events.js";
import { navItems } from "../src/lib/navigation.js";
import { buildEventMessage, buildEventUrl } from "../src/lib/whatsapp.js";

const NEGOCIO = "AT Turismo y Traslados";

const lista = [
  { title: "Pasado", description: "d", date: "2026-10-31" },
  { title: "Hoy", description: "d", date: "2026-11-01", time: "21:00" },
  { title: "Futuro", description: "d", date: "2027-01-09" },
];

test("events.json commiteado esta vacio: no se publica ningun evento de ejemplo", () => {
  assert.ok(Array.isArray(events));
  assert.deepEqual(events, []);
});

test("proximosEventos descarta los pasados y conserva el de hoy", () => {
  assert.deepEqual(
    proximosEventos(lista, "2026-11-01").map((e) => e.title),
    ["Hoy", "Futuro"],
  );
  assert.deepEqual(proximosEventos(lista, "2027-06-01"), []);
});

test("sin una fecha valida no se filtra nada (es el render del servidor)", () => {
  assert.equal(proximosEventos(lista, "").length, 3);
  assert.equal(proximosEventos(lista, null).length, 3);
  assert.deepEqual(proximosEventos(null, "2026-11-01"), []);
});

test("formatearFechaEvento da el formato largo es-AR y no depende de la zona horaria", () => {
  assert.equal(formatearFechaEvento("2026-11-14"), "sábado 14 de noviembre");
  assert.equal(formatearFechaEvento("2027-01-09"), "sábado 9 de enero");
  assert.equal(formatearFechaEvento("2026-03-01"), "domingo 1 de marzo");
  assert.equal(formatearFechaEvento(""), "");
  assert.equal(formatearFechaEvento("14/11/2026"), "14/11/2026");
});

test("dateTimeAttr arma el valor del <time> con y sin hora", () => {
  assert.equal(dateTimeAttr({ date: "2026-11-14", time: "21:00" }), "2026-11-14T21:00");
  assert.equal(dateTimeAttr({ date: "2026-11-14" }), "2026-11-14");
  assert.equal(dateTimeAttr({}), "");
});

test("sin eventos no hay link de Eventos en la navegacion", () => {
  const items = navItems(undefined, []);
  assert.equal(items.some((i) => i.href === "#eventos"), false);
});

test("con al menos un evento aparece el link, despues de Cómo funciona", () => {
  const items = navItems(undefined, lista);
  const hrefs = items.map((i) => i.href);
  assert.deepEqual(hrefs, ["#servicios", "#como-funciona", "#eventos", "#por-que", "#faq", "#cotizar"]);
});

test("el mensaje del evento lleva titulo, dia, hora y el saludo con el negocio", () => {
  const msg = buildEventMessage(
    { title: "Recital en la Plaza del Agua", date: "2026-11-14", time: "21:00" },
    { businessName: NEGOCIO },
  );
  assert.ok(msg.startsWith(`¡Hola ${NEGOCIO}! Quiero consultar por un traslado para este evento:`));
  assert.ok(msg.includes("• Evento: Recital en la Plaza del Agua"));
  assert.ok(msg.includes("• Día: sábado 14 de noviembre"));
  assert.ok(msg.includes("• Hora: 21:00"));
});

test("sin hora, el mensaje del evento no inventa una linea de hora", () => {
  const msg = buildEventMessage({ title: "Fiesta del Mar", date: "2027-01-09" }, { businessName: NEGOCIO });
  assert.ok(!msg.includes("Hora"));
  assert.ok(msg.includes("• Día: sábado 9 de enero"));
});

test("buildEventUrl queda muy por debajo del presupuesto de la URL de WhatsApp", () => {
  const url = buildEventUrl(
    { title: "T".repeat(120), date: "2026-11-14", time: "21:00" },
    { businessName: NEGOCIO },
  );
  const parsed = new URL(url);
  assert.equal(parsed.origin + parsed.pathname, "https://wa.me/5492235719924");
  assert.ok(url.length < 2000, `la URL mide ${url.length} caracteres`);
});
