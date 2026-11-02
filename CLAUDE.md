# CLAUDE.md — AT Turismo y Traslados (landing)

Landing de una sola página para un servicio de **traslados y viajes de Mar del Plata**.
Sin backend, sin base de datos, sin autenticación, sin datos sensibles. El formulario de
cotización arma un mensaje y abre WhatsApp.

> Este proyecto **no** es AgendaProMed / hcdigital. Ignorá cualquier regla heredada de ese
> repo (Next 15, Tailwind 3, cookies, proxy al backend, "nunca `npm install`", presupuesto
> de lint). Acá manda este archivo y `PLAN.md`.

---

## 1. Stack exacto

| Pieza | Versión / forma |
|---|---|
| Next.js | **16.4.3**, App Router, `src/app/` |
| React | **19.3** |
| Tailwind | **4**, CSS-first: `@theme` dentro de `src/app/globals.css`. **No existe `tailwind.config.js` y no se crea.** |
| Lenguaje | **JavaScript**. Nada de TypeScript ni `.ts/.tsx`. |
| ESLint | **9 flat config** (`eslint.config.mjs`). `npm run lint` = `eslint`. **`next lint` ya no existe.** |
| Tests | `node --test` (incluido en Node 24). `npm test` = `node --test tests/` |
| Config | `next.config.mjs` con `cacheComponents: true` y `partialPrefetching: true` (defaults del scaffold; no se tocan sin motivo) |

`cacheComponents: true` tiene una consecuencia concreta: **`new Date()`, `Date.now()`,
`Math.random()` y `crypto.randomUUID()` durante el prerender rompen el build.** Todo lo que
dependa de la fecha actual (año del footer, `min` de los inputs de fecha) se calcula **en el
cliente después del mount** o se recibe como parámetro. Las funciones de `src/lib/` son puras:
`today` entra por argumento.

## 2. Antes de usar una API de Next

Leer `AGENTS.md` y la guía correspondiente en **`node_modules/next/dist/docs/`**
(por ejemplo `01-app/01-getting-started/14-metadata-and-og-images.md`). Esta versión tiene
cambios de ruptura respecto de lo que cualquiera recuerde de Next 14/15.

## 3. Dependencias

Solo lo que ya está en `package.json`: **Next, React, Tailwind 4, ESLint y `lucide-react`**.
Cualquier otra librería se pide a quien coordina, no se instala por cuenta propia.

- `exceljs` es **devDependency** y existe por una sola razón: leer `data/eventos.xlsx` en el
  build (`scripts/`). **Nunca se importa desde `src/`.** No se usa `xlsx`/SheetJS.

- `lucide-react@1.66` **no trae íconos de marca**. WhatsApp e Instagram son SVG inline en
  `src/components/ui/BrandIcons.jsx`.
- Animaciones: CSS + un `IntersectionObserver` propio (`src/components/ui/Reveal.jsx`).
  Nada de `framer-motion`/`motion`.

## 4. Datos de contacto

**Todos los datos de contacto viven en `src/data/contact.json` y se consumen por
`src/lib/contact.js`.** Nunca se escribe un teléfono, un link de WhatsApp, un usuario de
Instagram ni un email en el JSX ni en otro módulo.

Verificación: `rg -n "5492235719924|571-9924|traslados\.mdp" src --glob '!src/data/contact.json'`
tiene que dar **0 resultados**.

Regla del contrato: **string vacío = no se muestra y no se emite en el JSON-LD.**

`contact.json` tiene además un campo que no es de contacto: **`eventsSheet`**, la URL de la
Google Sheet de eventos (ver 4b). Vacío es válido y significa "sin hoja". Si tiene algo,
`assertContact` verifica que sea un link de Google Sheets del que se pueda derivar el CSV:
si no, el sitio se quedaría mudo con el fallback sin que nadie se enterara.

Los textos de las secciones viven en `src/data/content.json`. Revisalos con el cliente: no
afirmes seguros, horarios ni precios que no estén confirmados.

## 4b. Eventos: dos fuentes, una sola validación

La sección "Próximos eventos" se alimenta de **dos fuentes posibles**, resueltas en el
servidor por `src/lib/events-source.js`:

1. **`contact.json → eventsSheet`**: la Google Sheet del dueño, leída en runtime. Si tiene
   algo, **manda**. Un evento nuevo aparece **sin redeploy** (ver abajo).
2. **`src/data/events.json`**, que genera el build desde `data/eventos.xlsx`. Es el único
   contenido si no hay hoja, y el **fallback** cuando la hoja falla.

El dueño edita **solo la hoja o solo la planilla** (instrucciones para él en `README.md`);
nadie edita `events.json` a mano.

| Pieza | Qué hace |
|---|---|
| `data/eventos.xlsx` | Hoja `Eventos` (Título, Descripción, Día, Hora, Banner, Activo) + hoja `Instrucciones`. Las filas de ejemplo van con `Activo = NO`. |
| `data/eventos-google-sheets.csv` | La misma plantilla en CSV, para importar a Drive y crear la Google Sheet. |
| `scripts/make-events-template.mjs` | `npm run eventos:plantilla`. **Pisa la planilla**: solo para regenerarla de cero. |
| `src/lib/events-parse.js` | Parseo y validación de una fila, **puras**: no tocan disco ni red ni el reloj, no conocen ExcelJS. Las usan **las dos** fuentes. `filasDesdeCsv` mapea la matriz del CSV a filas. |
| `scripts/lib/parse-events.mjs` | Solo re-exporta `src/lib/events-parse.js`, para no cambiar los imports de `scripts/`. Sin lógica. |
| `src/lib/csv.js` | Parser de CSV propio (comillas, comas y saltos de línea en el campo, BOM, CRLF). **`exceljs` sigue siendo devDependency y no entra en `src/`.** |
| `src/lib/sheet-url.js` | De cualquier link de Google Sheets a la URL del CSV (`/export?format=csv&gid=` o `/d/e/<KEY>/pub?output=csv`). |
| `src/lib/banner-hosts.js` | Hosts habilitados para un banner por URL **y** los `images.remotePatterns` que importa `next.config.mjs`. Una sola fuente, con test de coherencia. |
| `src/lib/events-source.js` | `getEvents()` con `'use cache'`. Elige la fuente, parsea, loguea y cae al fallback. **Solo servidor.** |
| `scripts/build-events.mjs` | `npm run eventos` y `prebuild`. Escribe `src/data/events.json` ordenado por fecha, o **corta el build** con los errores y su número de fila. |
| `src/lib/events.js` | Runtime: `proximosEventos(events, hoy)`, `formatearFechaEvento` (es-AR, en UTC) y `hoyISO()` (solo cliente). |
| `src/components/sections/Events.jsx` | La sección. Client Component, recibe los eventos **por props**. |

Reglas:

- **`prebuild` corre antes de `next build`**, también en Vercel (npm ejecuta `prebuild` solo).
  No encadenar el script dentro de `build`: se duplicaría.
- **`events.json` se commitea**, igual que cualquier `src/data/*.json`. En `main` tiene que
  estar en `[]` o solo con eventos reales del cliente: **nunca con los ejemplos**.
- **Las dos fuentes tratan los errores distinto, a propósito**: en el `.xlsx` una fila mala
  **corta el build** (hay un humano mirando la consola); en la hoja **se ignora la fila** con
  un `console.warn` del servidor y el resto se publica (nadie está mirando, y romper la
  landing por una celda sería peor). Por lo mismo, un banner local inexistente es error de
  build en el `.xlsx` y en la hoja se resuelve con el fallback visual de la tarjeta.
- **No se emite `Event` de schema.org.** Google exige `location` con un lugar concreto y la
  planilla no pide lugar; inventar un venue sería un dato estructurado falso. Documentado
  en `src/lib/jsonld.js`.

### Revalidación: por qué el evento aparece sin redeploy

`getEvents()` es `'use cache'` + `cacheLife({ stale: 300, revalidate: 300, expire: 3600 })`.
Es el equivalente en Cache Components del viejo `getStaticProps` con `revalidate`: `/` se
sigue prerenderizando estática (`next build` la reporta con `Revalidate 5m / Expire 1h`) y
cinco minutos después de una visita Next vuelve a pedir la hoja en segundo plano y regenera
el HTML.

Los números **no son libres**: con `expire` menor a 5 min el resultado queda fuera del
prerender y la sección pasaría a resolverse en cada request; con `stale` menor a 30 s se cae
del prefetch. Si hay que bajar el tiempo, leer
`node_modules/next/dist/docs/01-app/03-api-reference/04-functions/cacheLife.md#prerendering-behavior`
antes de tocarlo.

Lo que la hoja **no** hace: filtrar los eventos pasados. Eso necesita la fecha actual y con
`cacheComponents: true` el prerender no puede leerla (sigue siendo trabajo del cliente).

Para probar contra una hoja falsa hay un override de entorno, `EVENTS_SHEET_CSV_URL`, que se
usa **tal cual** sin pasar por la derivación de Google. Es solo para desarrollo: **no se
pone una URL de prueba en `contact.json`**.

### Banners por URL

La columna Banner acepta el nombre de un archivo de `public/eventos/` (como siempre) o una
**URL https de una imagen de Google Drive**. Hosts habilitados, y solo esos:
`lh3.googleusercontent.com`, `*.googleusercontent.com` y `drive.google.com/uc`. El link que
copia Drive (`/file/d/<ID>/view`) es una página HTML, no una imagen: el parser lo reescribe a
`https://lh3.googleusercontent.com/d/<ID>`.

Cualquier otro host **se rechaza en el parser**, y además no está en `remotePatterns`, así
que el optimizador devolvería 400. Si la imagen remota no carga, `BannerEvento` se cae al
fondo decorativo de marca (`onError`, por eso necesita estado por tarjeta).

**Filtrado de eventos pasados — decisión.** Con `cacheComponents: true` el prerender no puede
leer la fecha actual, así que no se puede filtrar en el servidor. `Events.jsx` es
`'use client'` y resuelve hoy con `useClientValue`:

- en el HTML prerenderizado y **sin JavaScript se ven todos** los eventos de la fuente, incluso
  alguno vencido (tolerante a propósito: mejor mostrar de más que esconder la sección);
- **con JavaScript**, al hidratar se descartan los pasados y, si no queda ninguno, la sección
  desaparece del DOM.

El link `#eventos` de la navegación lo decide `navItems(content, await getEvents())` en
`src/app/layout.js`: la **misma lista** que recibe la sección, de la **misma fuente activa**
y del mismo entry de caché (`getEvents` está cacheado, no son dos pedidos a la hoja). Ya no
se decide con `events.json` importado, que con la hoja configurada sería una lista distinta a
la que se renderiza. `navItems` ya no importa el JSON: el default es `[]`, el estado seguro
(nunca un link a una sección que no se renderizó).

Consecuencia conocida, igual que antes: si **todos** los eventos cargados ya pasaron, el link
queda en el menú aunque la sección se oculte, porque el filtro por fecha corre en el cliente
y el link se resuelve en el servidor. Por eso la planilla y el README piden borrar las filas
viejas.

El CTA "Consultar por este evento" **abre WhatsApp directo** con título, día y hora
(`buildEventMessage`), no pasa por el formulario: es un `<a href>` resuelto en el servidor,
funciona sin JS y no hay que arrastrar estado hasta `#cotizar`. Además el mensaje del
formulario **no puede** llevar una línea de evento: su presupuesto de URL de `wa.me`
(2000 caracteres) ya está en 1965 en el peor caso admitido, y el test lo verifica.

## 5. Cómo se corre

```bash
npm run dev                # desarrollo
npm run eventos            # regenera src/data/events.json desde data/eventos.xlsx
npm run eventos:plantilla  # REGENERA data/eventos.xlsx de cero (pisa lo cargado)
npm run lint               # ESLint 9 flat — obligatorio antes de cerrar una tarea
npm test                   # node --test tests/
npm run build              # prebuild (eventos) + next build; "/" tiene que quedar estática
npm start                  # servidor de producción local
```

Deploy: el repo **no** está conectado a Vercel por Git. Son dos pasos, `git push` y después
`vercel deploy --prod`.

`src/lib/*.js` y `scripts/lib/*.mjs` se importan desde los tests con **rutas relativas, no con el alias `@/`**,
porque `node --test` no resuelve el alias de `jsconfig.json`. En los componentes sí se usa `@/`.

## 6. Propiedad de archivos (para no pisarse entre agentes)

| Archivo | Dueño |
|---|---|
| `src/lib/seo.js`, `src/lib/jsonld.js`, `src/components/seo/*`, `src/app/{robots,sitemap,manifest}.js`, `src/app/icon.png`, `apple-icon.png`, `opengraph-image.*`, `scripts/generate-brand-assets.mjs` | Agente-SEO |
| `src/app/layout.js` | Agente-Frontend. SEO solo agrega/ajusta la línea de `export { metadata, viewport }` y el montaje de `<JsonLd />` |
| El resto de `src/`, `scripts/build-events.mjs`, `scripts/make-events-template.mjs`, `scripts/lib/`, `data/eventos.xlsx` | Agente-Frontend |

## 7. Principios

- Mobile primero de verdad: el layout se revisa a **360 px** sin scroll horizontal.
- Accesibilidad como piso: un `<h1>` único, `<label>` visible por campo, foco visible,
  todo operable con teclado, `aria-label` en los botones que son solo ícono, contraste ≥ 4.5:1
  (≥ 3:1 en texto grande). La tabla de contraste está documentada en `globals.css`.
- `prefers-reduced-motion: reduce` desactiva todas las animaciones.
- Mejora progresiva: **sin JS el contenido se ve igual**. `Reveal` solo oculta si hay JS.
- Server Components por defecto. `'use client'` solo en las hojas que necesitan estado o eventos.
- Los colores se usan por **token** (`bg-brand-navy`), nunca con el hex suelto en el JSX.
- Nada de entidades sin escapar en JSX: `&quot;`, `&apos;`, `&gt;`.
- Mínimo código necesario: no se agregan features que nadie pidió.
