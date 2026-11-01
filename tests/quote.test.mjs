import test from "node:test";
import assert from "node:assert/strict";

import {
  DEFAULT_MAX_PASAJEROS,
  MAX_NOMBRE,
  MAX_OBSERVACIONES,
  MAX_OBSERVACIONES_CODIFICADAS,
  MAX_TEXTO_CORTO,
  MAX_TEXTO_CORTO_CODIFICADO,
  digitosTelefono,
  validateQuote,
} from "../src/lib/validateQuote.js";
import { buildQuoteMessage, buildQuoteUrl, formatFecha } from "../src/lib/whatsapp.js";

const HOY = "2026-11-01";

const base = {
  origen: "Av. Colón 1234, Mar del Plata",
  destino: "Aeropuerto de Ezeiza",
  fechaSalida: "2026-11-10",
  fechaLlegada: "",
  horario: "05:30",
  pasajeros: "3",
  incluyeMenores: false,
  menores: "",
  observaciones: "",
  nombre: "Juana Pérez",
  telefono: "223 571-9924",
};

const v = (overrides = {}) => validateQuote({ ...base, ...overrides }, { today: HOY });

// ---------------------------------------------------------------- validacion

test("el caso feliz es valido", () => {
  const r = v();
  assert.equal(r.valid, true, JSON.stringify(r.errors));
  assert.deepEqual(r.fields, []);
});

test("un formulario vacio marca los 7 campos obligatorios, en orden", () => {
  const r = validateQuote({}, { today: HOY });
  assert.equal(r.valid, false);
  assert.deepEqual(r.fields, [
    "origen",
    "destino",
    "fechaSalida",
    "horario",
    "pasajeros",
    "nombre",
    "telefono",
  ]);
});

test("la fecha de salida no puede ser de ayer", () => {
  const r = v({ fechaSalida: "2026-10-31" });
  assert.equal(r.valid, false);
  assert.match(r.errors.fechaSalida, /anterior a hoy/);
});

test("la fecha de salida de hoy es valida", () => {
  assert.equal(v({ fechaSalida: HOY }).valid, true);
});

test("la fecha de llegada es opcional pero no puede ser anterior a la de salida", () => {
  assert.equal(v({ fechaLlegada: "" }).valid, true);
  assert.equal(v({ fechaLlegada: "2026-11-10" }).valid, true);
  const r = v({ fechaLlegada: "2026-11-09" });
  assert.equal(r.valid, false);
  assert.match(r.errors.fechaLlegada, /anterior a la de salida/);
});

test("menores = si sin cantidad es un error", () => {
  const r = v({ incluyeMenores: "si", menores: "" });
  assert.equal(r.valid, false);
  assert.match(r.errors.menores, /cuántos menores/);
});

test("no puede haber mas menores que pasajeros", () => {
  const r = v({ incluyeMenores: true, menores: "4", pasajeros: "3" });
  assert.equal(r.valid, false);
  assert.match(r.errors.menores, /no pueden ser más/);
  assert.equal(v({ incluyeMenores: true, menores: "3", pasajeros: "3" }).valid, true);
});

test("si no viajan menores, la cantidad cargada no se valida", () => {
  assert.equal(v({ incluyeMenores: false, menores: "99" }).valid, true);
});

test("los pasajeros son un entero entre 1 y el maximo", () => {
  assert.match(v({ pasajeros: "0" }).errors.pasajeros, /al menos una persona/);
  assert.match(v({ pasajeros: "2.5" }).errors.pasajeros, /entero/);
  assert.match(v({ pasajeros: "abc" }).errors.pasajeros, /entero/);
  assert.match(
    v({ pasajeros: String(DEFAULT_MAX_PASAJEROS + 1) }).errors.pasajeros,
    /WhatsApp/,
  );
  assert.equal(v({ pasajeros: String(DEFAULT_MAX_PASAJEROS) }).valid, true);
  assert.equal(
    validateQuote({ ...base, pasajeros: "30" }, { today: HOY, maxPasajeros: 40 }).valid,
    true,
  );
});

test("el horario tiene que ser HH:MM valido", () => {
  assert.equal(v({ horario: "" }).valid, false);
  assert.match(v({ horario: "25:00" }).errors.horario, /formato/);
  assert.equal(v({ horario: "00:00" }).valid, true);
  assert.equal(v({ horario: "23:59" }).valid, true);
});

test("el telefono admite + - ( ) y espacios, con 8 a 15 digitos", () => {
  assert.equal(digitosTelefono("+54 (223) 571-9924"), 12);
  assert.equal(digitosTelefono("223 ABC"), -1);
  assert.equal(v({ telefono: "+54 (223) 571-9924" }).valid, true);
  assert.match(v({ telefono: "1234567" }).errors.telefono, /entre 8 y 15/);
  assert.match(v({ telefono: "1234567890123456" }).errors.telefono, /entre 8 y 15/);
  assert.match(v({ telefono: "llamame al fijo" }).errors.telefono, /signos/);
});

test("las observaciones tienen tope de 500 caracteres", () => {
  assert.equal(v({ observaciones: "x".repeat(MAX_OBSERVACIONES) }).valid, true);
  assert.match(
    v({ observaciones: "x".repeat(MAX_OBSERVACIONES + 1) }).errors.observaciones,
    /500/,
  );
});

// ------------------------------------------------------------------- mensaje

test("formatFecha pasa de ISO a DD/MM/AAAA y deja pasar lo vacio", () => {
  assert.equal(formatFecha("2026-11-02"), "02/11/2026");
  assert.equal(formatFecha(""), "");
  assert.equal(formatFecha(undefined), "");
});

test("el mensaje saluda con el nombre y lista los datos cargados", () => {
  const msg = buildQuoteMessage(base, { businessName: "AT Turismo y Viajes" });
  assert.ok(msg.startsWith("¡Hola AT Turismo y Viajes! Soy Juana Pérez y quiero cotizar un viaje."));
  assert.ok(msg.includes("• Origen: Av. Colón 1234, Mar del Plata"));
  assert.ok(msg.includes("• Fecha de salida: 10/11/2026"));
  assert.ok(msg.includes("• Horario: 05:30"));
  assert.ok(msg.includes("• Pasajeros: 3"));
  assert.ok(msg.includes("• Teléfono de contacto: 223 571-9924"));
});

test("sin fecha de llegada la linea no aparece; con fecha, si", () => {
  assert.ok(!buildQuoteMessage(base).includes("Fecha de llegada"));
  assert.ok(
    buildQuoteMessage({ ...base, fechaLlegada: "2026-11-15" }).includes(
      "• Fecha de llegada: 15/11/2026",
    ),
  );
});

test("la linea de menores solo aparece si viajan menores", () => {
  assert.ok(!buildQuoteMessage(base).includes("Menores"));
  assert.ok(!buildQuoteMessage({ ...base, incluyeMenores: false, menores: "2" }).includes("Menores"));
  assert.ok(
    buildQuoteMessage({ ...base, incluyeMenores: "si", menores: "2" }).includes("• Menores: 2"),
  );
});

test("sin observaciones la linea no aparece", () => {
  assert.ok(!buildQuoteMessage(base).includes("Observaciones"));
  assert.ok(buildQuoteMessage({ ...base, observaciones: "Llevo 2 valijas" }).includes("• Observaciones: Llevo 2 valijas"));
});

test("observaciones con emoji y `&` sobreviven el ida y vuelta por la URL", () => {
  const observaciones = "Somos 2 adultos & 1 bebé 👶 ¿hay silla? 100% seguro #viaje";
  const values = { ...base, observaciones };
  const url = buildQuoteUrl(values, { businessName: "AT Turismo y Viajes" });
  const parsed = new URL(url);
  assert.equal(parsed.origin + parsed.pathname, "https://wa.me/5492235719924");
  assert.equal(parsed.searchParams.get("text"), buildQuoteMessage(values, { businessName: "AT Turismo y Viajes" }));
  assert.ok(parsed.searchParams.get("text").includes(observaciones));
});

test("un texto que reventaria la URL de WhatsApp se rechaza en la validacion", () => {
  // 500 caracteres acentuados se codifican como 3000: entran en el tope de
  // caracteres pero no en el presupuesto de la URL. Tiene que dar error.
  const r = v({ observaciones: "á".repeat(MAX_OBSERVACIONES) });
  assert.equal(r.valid, false);
  assert.match(r.errors.observaciones, /muy largo/);
  // Un texto en castellano normal de 500 caracteres si pasa.
  const normal = "Llevamos dos valijas grandes y un bolso de mano. ".repeat(10).slice(0, MAX_OBSERVACIONES);
  assert.equal(v({ observaciones: normal }).valid, true);
});

test("con todos los campos en su maximo VALIDO la URL queda por debajo de 2000", () => {
  const relleno = (n) => "Avenida Juan B. Justo número ".repeat(20).slice(0, n);
  const values = {
    origen: relleno(MAX_TEXTO_CORTO),
    destino: relleno(MAX_TEXTO_CORTO),
    fechaSalida: "2026-12-31",
    fechaLlegada: "2027-01-15",
    horario: "23:59",
    pasajeros: String(DEFAULT_MAX_PASAJEROS),
    incluyeMenores: true,
    menores: String(DEFAULT_MAX_PASAJEROS),
    observaciones: "Observación con acentos y ñ para el caso real. ".repeat(20).slice(0, MAX_OBSERVACIONES),
    nombre: relleno(MAX_NOMBRE),
    telefono: "+54 (223) 571-9924",
  };
  const r = validateQuote(values, { today: HOY });
  assert.equal(r.valid, true, `el caso tope tiene que ser valido: ${JSON.stringify(r.errors)}`);

  const url = buildQuoteUrl(values, { businessName: "AT Turismo y Viajes" });
  assert.ok(url.length < 2000, `la URL mide ${url.length} caracteres`);
});

test("el peor caso admitido por los topes codificados no llega a 2000", () => {
  // Cota superior teorica: todos los campos libres en su maximo de bytes
  // codificados permitido por validateQuote.
  const presupuesto =
    MAX_TEXTO_CORTO_CODIFICADO * 2 + MAX_TEXTO_CORTO_CODIFICADO + MAX_OBSERVACIONES_CODIFICADAS;
  const fijo = buildQuoteUrl(
    {
      origen: "o",
      destino: "d",
      fechaSalida: "2026-12-31",
      fechaLlegada: "2027-01-15",
      horario: "23:59",
      pasajeros: "20",
      incluyeMenores: true,
      menores: "20",
      observaciones: "x",
      nombre: "n",
      telefono: "+54 (223) 571-9924",
    },
    { businessName: "AT Turismo y Viajes" },
  ).length;
  assert.ok(fijo + presupuesto < 2000, `cota superior: ${fijo + presupuesto}`);
});

test("buildQuoteUrl acepta un contacto inyectado", () => {
  const url = buildQuoteUrl(base, {
    contact: { whatsapp: { number: "5491122223333" } },
  });
  assert.ok(url.startsWith("https://wa.me/5491122223333?text="));
});
