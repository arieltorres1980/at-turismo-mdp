import test from "node:test";
import assert from "node:assert/strict";

import contact from "../src/data/contact.json" with { type: "json" };
import {
  assertContact,
  emailHref,
  hasValue,
  instagramUrl,
  telHref,
  waLink,
} from "../src/lib/contact.js";

const clone = (overrides = {}) => ({
  ...structuredClone(contact),
  ...overrides,
});

test("waLink sin texto devuelve el link limpio, sin `+`", () => {
  assert.equal(waLink(), "https://wa.me/5492235719924");
  assert.equal(waLink("   "), "https://wa.me/5492235719924");
  assert.ok(!waLink().includes("+"));
});

test("waLink codifica `&`, `#` y saltos de linea, y se decodifica igual", () => {
  const texto = "Juan & Ana\nViaje #12 al 50%";
  const url = waLink(texto);
  assert.ok(url.startsWith("https://wa.me/5492235719924?text="));
  assert.ok(!url.includes("&amp;"));
  assert.ok(!url.slice(url.indexOf("?text=") + 6).includes("&"));
  assert.ok(!url.includes("#"));
  assert.ok(!url.includes("\n"));
  assert.equal(new URL(url).searchParams.get("text"), texto);
});

test("telHref, instagramUrl y emailHref respetan el contrato de string vacio", () => {
  assert.equal(telHref(), "tel:+5492235719924");
  assert.equal(instagramUrl(), "https://www.instagram.com/traslados.mdp.ok/");
  assert.equal(emailHref(), null, "el email esta vacio en contact.json");
  assert.equal(emailHref(clone({ email: "hola@ejemplo.com" })), "mailto:hola@ejemplo.com");
  assert.equal(telHref(clone({ phone: { display: "", e164: "" } })), null);
  assert.equal(instagramUrl(clone({ instagram: { user: "", url: "" } })), null);
});

test("hasValue distingue vacio, espacios y no-strings", () => {
  assert.equal(hasValue("hola"), true);
  assert.equal(hasValue(""), false);
  assert.equal(hasValue("   "), false);
  assert.equal(hasValue(undefined), false);
  assert.equal(hasValue(42), false);
});

test("assertContact pasa con el contact.json real", () => {
  assert.equal(assertContact(), true);
});

test("assertContact lanza si el numero de WhatsApp tiene `+` o espacios", () => {
  assert.throws(
    () => assertContact(clone({ whatsapp: { number: "+5492235719924", defaultMessage: "" } })),
    /whatsapp\.number/,
  );
  assert.throws(
    () => assertContact(clone({ whatsapp: { number: "549 223 571 9924", defaultMessage: "" } })),
    /whatsapp\.number/,
  );
  assert.throws(
    () => assertContact(clone({ whatsapp: { number: "12345", defaultMessage: "" } })),
    /whatsapp\.number/,
  );
});

test("assertContact lanza si siteUrl termina en `/` o no es https", () => {
  assert.throws(
    () => assertContact(clone({ siteUrl: "https://at-turismo-mdp.vercel.app/" })),
    /no puede terminar con/,
  );
  assert.throws(
    () => assertContact(clone({ siteUrl: "http://at-turismo-mdp.vercel.app" })),
    /https:\/\//,
  );
});

test("eventsSheet vacio es valido (sin hoja se usan los eventos de events.json)", () => {
  assert.equal(contact.eventsSheet, "", "en main la hoja no esta configurada");
  assert.equal(assertContact(clone({ eventsSheet: "" })), true);
  assert.equal(assertContact(clone({ eventsSheet: undefined })), true);
  assert.equal(
    assertContact(
      clone({ eventsSheet: "https://docs.google.com/spreadsheets/d/1Abc-DEF/edit#gid=0" }),
    ),
    true,
  );
});

test("assertContact lanza si eventsSheet no es un link de Google Sheets", () => {
  assert.throws(() => assertContact(clone({ eventsSheet: "https://ejemplo.com/eventos.csv" })), /eventsSheet/);
  assert.throws(() => assertContact(clone({ eventsSheet: "mi planilla" })), /eventsSheet/);
  assert.throws(() => assertContact(clone({ eventsSheet: 42 })), /eventsSheet/);
});

test("assertContact lanza si falta businessName", () => {
  assert.throws(() => assertContact(clone({ businessName: "" })), /businessName/);
});

test("el contact.json real cumple el contrato esperado por la UI", () => {
  assert.equal(contact.locale, "es-AR");
  assert.match(contact.phone.e164, /^\+\d{10,15}$/);
  assert.ok(contact.description.length <= 160, "description tiene que entrar como meta description");
  assert.ok(contact.description.length >= 120, "description demasiado corta para SEO");
});
