/**
 * De la URL que pega el dueño en `contact.eventsSheet` a la URL del CSV
 * (`src/lib/sheet-url.js`), y validacion de los banners cargados como URL
 * (`src/lib/banner-hosts.js`), incluida la coincidencia con los
 * `images.remotePatterns` que consume `next.config.mjs`.
 */
import test from "node:test";
import assert from "node:assert/strict";

import { PATRONES_BANNER_REMOTO, normalizarBannerRemoto } from "../src/lib/banner-hosts.js";
import { csvUrlDeHoja } from "../src/lib/sheet-url.js";
import { parseBanner } from "../src/lib/events-parse.js";

const ID = "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms";
const KEY = "2PACX-1vQx9zAbCdEfGhIjKlMnOpQrStUvWxYz0123456789";

// --------------------------------------------------------------- csvUrlDeHoja

test("link normal de la hoja: deriva el export CSV y respeta el gid", () => {
  assert.deepEqual(csvUrlDeHoja(`https://docs.google.com/spreadsheets/d/${ID}/edit#gid=0`), {
    ok: true,
    tipo: "export",
    url: `https://docs.google.com/spreadsheets/d/${ID}/export?format=csv&gid=0`,
  });

  assert.equal(
    csvUrlDeHoja(`https://docs.google.com/spreadsheets/d/${ID}/edit?gid=1842#gid=1842`).url,
    `https://docs.google.com/spreadsheets/d/${ID}/export?format=csv&gid=1842`,
  );

  // Sin gid se asume la primera pestaña.
  assert.equal(
    csvUrlDeHoja(`https://docs.google.com/spreadsheets/d/${ID}`).url,
    `https://docs.google.com/spreadsheets/d/${ID}/export?format=csv&gid=0`,
  );

  // Con el `/u/0/` que agrega Google cuando hay varias cuentas, y con espacios.
  assert.equal(
    csvUrlDeHoja(`  https://docs.google.com/spreadsheets/u/0/d/${ID}/edit?usp=sharing  `).url,
    `https://docs.google.com/spreadsheets/d/${ID}/export?format=csv&gid=0`,
  );
});

test('link de "publicar en la web": se usa la URL de pub', () => {
  assert.deepEqual(csvUrlDeHoja(`https://docs.google.com/spreadsheets/d/e/${KEY}/pub?output=csv`), {
    ok: true,
    tipo: "publicada",
    url: `https://docs.google.com/spreadsheets/d/e/${KEY}/pub?output=csv`,
  });

  assert.equal(
    csvUrlDeHoja(`https://docs.google.com/spreadsheets/d/e/${KEY}/pubhtml?gid=7&single=true`).url,
    `https://docs.google.com/spreadsheets/d/e/${KEY}/pub?output=csv&gid=7&single=true`,
  );
});

test("csvUrlDeHoja rechaza lo que no es una Google Sheet, con un motivo util", () => {
  const malos = [
    "",
    "   ",
    null,
    42,
    "no es una url",
    `http://docs.google.com/spreadsheets/d/${ID}/edit`,
    "https://ejemplo.com/eventos.csv",
    "https://docs.google.com/document/d/abc/edit",
    "https://drive.google.com/file/d/abc/view",
  ];
  for (const malo of malos) {
    const r = csvUrlDeHoja(malo);
    assert.equal(r.ok, false, `deberia rechazar ${JSON.stringify(malo)}`);
    assert.ok(r.motivo.length > 0);
  }
});

// -------------------------------------------------------- banners por URL

test("el link que copia Drive se reescribe a la URL directa de la imagen", () => {
  assert.deepEqual(
    normalizarBannerRemoto("https://drive.google.com/file/d/1AbCdEf-ghi/view?usp=sharing"),
    { ok: true, url: "https://lh3.googleusercontent.com/d/1AbCdEf-ghi" },
  );
  assert.deepEqual(normalizarBannerRemoto("https://drive.google.com/open?id=1AbCdEf-ghi"), {
    ok: true,
    url: "https://lh3.googleusercontent.com/d/1AbCdEf-ghi",
  });
});

test("las dos formas directas se aceptan y se limpia la query", () => {
  assert.deepEqual(normalizarBannerRemoto("https://drive.google.com/uc?export=view&id=1AbC"), {
    ok: true,
    url: "https://drive.google.com/uc?export=view&id=1AbC",
  });
  assert.deepEqual(normalizarBannerRemoto("https://drive.google.com/uc?id=1AbC&export=download"), {
    ok: true,
    url: "https://drive.google.com/uc?export=view&id=1AbC",
  });
  assert.deepEqual(
    normalizarBannerRemoto("https://lh3.googleusercontent.com/d/1AbC=w1200?usp=sharing"),
    { ok: true, url: "https://lh3.googleusercontent.com/d/1AbC=w1200" },
  );
});

test("se rechaza http, otro dominio y un link de Drive que no es un archivo", () => {
  assert.equal(normalizarBannerRemoto("http://lh3.googleusercontent.com/d/1AbC").ok, false);
  assert.equal(normalizarBannerRemoto("https://ejemplo.com/banner.jpg").ok, false);
  assert.equal(normalizarBannerRemoto("https://drive.google.com/drive/folders/1AbC").ok, false);
  assert.equal(normalizarBannerRemoto("no es una url").ok, false);
  assert.match(normalizarBannerRemoto("https://ejemplo.com/banner.jpg").motivo, /ejemplo\.com/);
});

test("parseBanner distingue archivo local de URL y propaga el motivo del rechazo", () => {
  assert.deepEqual(parseBanner("recital.jpg"), { ok: true, banner: "recital.jpg" });
  assert.deepEqual(parseBanner("https://drive.google.com/file/d/1AbC/view"), {
    ok: true,
    bannerUrl: "https://lh3.googleusercontent.com/d/1AbC",
  });
  const malo = parseBanner("https://ejemplo.com/banner.jpg");
  assert.equal(malo.ok, false);
  assert.match(malo.motivo, /dominio no habilitado/);
});

// -------------------------------------- coherencia con images.remotePatterns

/** Matcher minimo equivalente al de `next/image` para los patrones que usamos. */
function matchea(patron, url) {
  const u = new URL(url);
  if (`${patron.protocol}:` !== u.protocol) return false;

  const host = patron.hostname.startsWith("**.")
    ? u.hostname === patron.hostname.slice(3) || u.hostname.endsWith(patron.hostname.slice(2))
    : u.hostname === patron.hostname;
  if (!host) return false;

  if (patron.pathname === "/**") {
    if (u.pathname === "/") return false;
  } else if (patron.pathname !== undefined && patron.pathname !== u.pathname) {
    return false;
  }

  if (patron.search !== undefined && u.search !== patron.search) return false;
  return true;
}

test("toda URL que el parser acepta esta cubierta por images.remotePatterns", () => {
  const entradas = [
    "https://drive.google.com/file/d/1AbC/view?usp=sharing",
    "https://drive.google.com/open?id=1AbC",
    "https://drive.google.com/uc?export=view&id=1AbC",
    "https://lh3.googleusercontent.com/d/1AbC=w1200",
  ];

  for (const entrada of entradas) {
    const r = normalizarBannerRemoto(entrada);
    assert.equal(r.ok, true, entrada);
    assert.ok(
      PATRONES_BANNER_REMOTO.some((patron) => matchea(patron, r.url)),
      `next.config no habilita ${r.url} (venia de ${entrada})`,
    );
  }
});

test("un host no habilitado en el parser tampoco pasa por remotePatterns", () => {
  assert.equal(
    PATRONES_BANNER_REMOTO.some((patron) => matchea(patron, "https://ejemplo.com/banner.jpg")),
    false,
  );
});
