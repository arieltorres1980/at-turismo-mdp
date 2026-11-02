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

Los textos de las secciones viven en `src/data/content.json`. Revisalos con el cliente: no
afirmes seguros, horarios ni precios que no estén confirmados.

## 4b. Eventos: la planilla es la fuente de verdad

`data/eventos.xlsx` → `scripts/build-events.mjs` → `src/data/events.json` → sección
"Próximos eventos". El dueño del negocio edita **solo la planilla** (instrucciones para él
en `README.md`); nadie edita `events.json` a mano.

| Pieza | Qué hace |
|---|---|
| `data/eventos.xlsx` | Hoja `Eventos` (Título, Descripción, Día, Hora, Banner, Activo) + hoja `Instrucciones`. Las filas de ejemplo van con `Activo = NO`. |
| `scripts/make-events-template.mjs` | `npm run eventos:plantilla`. **Pisa la planilla**: solo para regenerarla de cero. |
| `scripts/lib/parse-events.mjs` | Parseo y validación, **funciones puras**: no tocan disco, no leen el reloj, no conocen ExcelJS. Acá van los tests. |
| `scripts/build-events.mjs` | `npm run eventos` y `prebuild`. Escribe `src/data/events.json` ordenado por fecha, o **corta el build** con los errores y su número de fila. |
| `src/lib/events.js` | Runtime: `proximosEventos(events, hoy)`, `formatearFechaEvento` (es-AR, en UTC) y `hoyISO()` (solo cliente). |
| `src/components/sections/Events.jsx` | La sección. Client Component (ver abajo). |

Reglas:

- **`prebuild` corre antes de `next build`**, también en Vercel (npm ejecuta `prebuild` solo).
  No encadenar el script dentro de `build`: se duplicaría.
- **`events.json` se commitea**, igual que cualquier `src/data/*.json`. En `main` tiene que
  estar en `[]` o solo con eventos reales del cliente: **nunca con los ejemplos**.
- Un banner nombrado en la planilla que no exista en `public/eventos/` es **error de build**,
  no un `<img>` roto en producción.
- **No se emite `Event` de schema.org.** Google exige `location` con un lugar concreto y la
  planilla no pide lugar; inventar un venue sería un dato estructurado falso. Documentado
  en `src/lib/jsonld.js`.

**Filtrado de eventos pasados — decisión.** Con `cacheComponents: true` el prerender no puede
leer la fecha actual, así que no se puede filtrar en el servidor. `Events.jsx` es
`'use client'` y resuelve hoy con `useClientValue`:

- en el HTML prerenderizado y **sin JavaScript se ven todos** los eventos del JSON, incluso
  alguno vencido (tolerante a propósito: mejor mostrar de más que esconder la sección);
- **con JavaScript**, al hidratar se descartan los pasados y, si no queda ninguno, la sección
  desaparece del DOM.

El link `#eventos` de la navegación se decide **en el build** con el JSON completo
(`src/lib/navigation.js`), igual que el de testimonios: si `events.json` está vacío, no
existe. Consecuencia conocida: si **todos** los eventos cargados ya pasaron, el link queda en
el menú aunque la sección se oculte. Por eso la planilla y el README piden borrar las filas
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
