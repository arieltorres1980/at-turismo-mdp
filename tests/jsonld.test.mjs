import test from "node:test";
import assert from "node:assert/strict";

import contact from "../src/data/contact.json" with { type: "json" };
import { buildJsonLd, serializeJsonLd } from "../src/lib/jsonld.js";
import { metadata } from "../src/lib/seo.js";

const clone = (o = {}) => ({ ...structuredClone(contact), ...o });
const biz = (g) => g["@graph"].find((n) => n["@id"].endsWith("#business"));

test("email vacio: la clave no existe", () => {
  assert.equal("email" in biz(buildJsonLd(clone({ email: "" }))), false);
});

test("email con valor: se emite", () => {
  assert.equal(biz(buildJsonLd(clone({ email: "a@b.com" }))).email, "a@b.com");
});

test("telephone es el e164 y sameAs incluye Instagram", () => {
  const b = biz(buildJsonLd(contact));
  assert.equal(b.telephone, contact.phone.e164);
  assert.ok(b.sameAs.includes(contact.instagram.url));
});

test("address omite campos vacios; areaServed descarta TODO_CLIENTE", () => {
  const b = biz(buildJsonLd(contact));
  assert.equal("streetAddress" in b.address, false);
  assert.equal("postalCode" in b.address, false);
  assert.equal(b.address.addressLocality, "Mar del Plata");
  assert.deepEqual(b.areaServed, [{ "@type": "City", name: "Mar del Plata" }]);
});

test("sin direccion real no se emite address", () => {
  const data = clone({
    address: { street: "", locality: "", region: "", postalCode: "", country: "" },
  });
  assert.equal("address" in biz(buildJsonLd(data)), false);
});

test("sin Review, AggregateRating ni FAQPage; @id estables", () => {
  const s = JSON.stringify(buildJsonLd(contact));
  assert.doesNotMatch(s, /Review|AggregateRating|FAQPage/);
  const g = buildJsonLd(contact)["@graph"];
  assert.equal(g[1].publisher["@id"], g[0]["@id"]);
});

test("serializeJsonLd escapa < y sigue siendo JSON valido", () => {
  const out = serializeJsonLd({ a: "</script><b>" });
  assert.equal(out.includes("<"), false);
  assert.deepEqual(JSON.parse(out), { a: "</script><b>" });
});

test("metadata: title <= 60, description 120-160, canonical y locale", () => {
  assert.ok(metadata.title.default.length <= 60, String(metadata.title.default.length));
  assert.ok(metadata.description.length >= 120 && metadata.description.length <= 160);
  assert.equal(metadata.alternates.canonical, "/");
  assert.equal(metadata.openGraph.locale, "es_AR");
});
