# PLAN — Landing "AT Turismo y Viajes" (Mar del Plata)

> Autor: Agente-lider · Fecha: 2026-11-01 · Estado: **borrador, con decisiones abiertas (ver §3)**
> Carpeta: `D:\WEBS\Turismo` · Ejecutan: Agente-Frontend (y opcionalmente Agente-FrontendJr), Agente-SEO · Verifica: Agente-reviewer

---

## 1. Estado y alcance

**Qué resuelve:** una landing de una sola página (`/`) para un servicio de traslados y viajes de
Mar del Plata. Es moderna, animada, responsive y accesible. Tiene un formulario de cotización que
arma un mensaje y abre WhatsApp, sin backend. Todos los datos de contacto viven en un único JSON
editable. El SEO técnico queda completo. Se publica en GitHub y en Vercel.

**Fuera de alcance:**
- Backend, base de datos, envío de emails, guardar las cotizaciones o pasarela de pagos.
- CMS o panel para editar contenido. Se edita a mano en los JSON de `src/data/`.
- Varias páginas o idiomas. Solo hay `/` en es-AR, más las rutas técnicas (`robots.txt`,
  `sitemap.xml`, íconos y OG).
- Analytics, píxeles y cookies de terceros. Si se piden, se planifican aparte porque exigen un
  aviso de privacidad.
- Alta en Google Search Console y Google Business Profile. Va como tarea opcional (G5),
  supeditada al dominio.
- Fotos de stock o generadas. Ver D8.

---

## 2. Mapa de lo que hay hoy (relevado el 2026-11-01)

| Qué | Evidencia | Consecuencia para el plan |
|---|---|---|
| La carpeta solo tiene el logo | `D:\WEBS\Turismo\Logo.jpg`: 22.878 bytes, JPEG **640x640**, 3 canales (sin transparencia) | El logo tiene **fondo negro sólido**. Sobre fondo claro se ve como un cuadrado negro (ver D8 y A3). |
| El logo dice otro nombre | En la imagen se lee "A.T" + "**TURISMO Y TRASLADOS**". El pedido dice "AT Turismo y **Viajes**" | Hay que decidir el nombre comercial (D1). |
| Colores del logo | Visual: negro, azul marino (letras "A.T"), azul medio (ola), dorado (corona y ola) | Se miden los hex exactos en A3. **El azul marino sobre negro no llega al contraste AA.** |
| Node / npm | `node -v` → v24.10.0 · `npm -v` → 11.6.1 | Cumple `next@16.4.3 engines: node >=20.9.0`. `node:test` viene incluido (sin dependencias). |
| Última estable de cada paquete | `npm view`: next **16.4.3**, react **19.3.1** (el scaffold fija 19.3.0), tailwindcss **4.3.3**, create-next-app 16.4.3, lucide-react 1.66.0 | El stack real es **Next 16 + React 19 + Tailwind 4**, no Next 15 + Tailwind 3 (ver §8, aviso a agentes). |
| create-next-app **falla** con la carpeta no vacía | Probado en el scratchpad: `The directory ... contains files that could conflict: Logo.jpg` (exit 2) | A1 tiene que sacar el logo antes del scaffold y devolverlo después. |
| Qué genera el scaffold (probado, sin instalar dependencias) | `package.json` con `"lint": "eslint"` (ESLint 9 flat, `eslint-config-next/core-web-vitals`), `@tailwindcss/turbopack`, `next.config.mjs` con **`cacheComponents: true`** y `partialPrefetching: true`, `src/app/{layout.js,page.js,globals.css,favicon.ico}`, `jsconfig.json` con alias `@/*`, `AGENTS.md` y `.gitignore` (ya ignora `.vercel` y `.env*`) | Tailwind 4 se configura en CSS (`@theme` en `globals.css`), **sin `tailwind.config.js`**. `next lint` ya no existe. `AGENTS.md` pide leer `node_modules/next/dist/docs/` antes de escribir código. |
| `sharp` disponible | `npm view next@16.4.3 optionalDependencies` → `sharp ^0.35.5` | Los íconos y la imagen OG se generan con un script Node, sin instalar nada. No hay ImageMagick (`which magick` no lo encuentra). |
| GitHub | `gh auth status` → logueado como **gtorresgrau** (keyring, https). `gh repo view gtorresgrau/at-turismo` → no existe | El nombre del repo está libre (o se elige otro en D6). |
| Git | v2.52.0. user.name = gtorresgrau, user.email = gonzalotorresgrau@gmail.com. `D:\WEBS\Turismo` no es un repo | El scaffold inicializa git. |
| Vercel | CLI 65.9.0, `vercel whoami` → gtorresgrau. `vercel teams ls` → único team "Gonzalo Torres Grau's projects", **plan hobby** | **El plan Hobby prohíbe el uso comercial** (ver D2). |
| Proyecto parecido en el disco | `D:\WEBS\dr-blanco-landing` (Next 14, TS, Tailwind 3, `components/Contact.tsx`) | Sirve solo como referencia visual. No se puede reutilizar (es TS y otro major). |
| Botón de WhatsApp existente | `D:\WEBS\cavigliamdq\src\components\BotonWSP\BotonWsp.jsx:41-53` | **No se reutiliza**: pone un `<button>` dentro de un `<a>` (HTML inválido), depende del hover (no anda en touch) y usa `wa.me/+54...` (el formato correcto va sin `+`). Solo confirma el patrón `wa.me/<num>?text=`. |
| Datos del pedido | Teléfono "+54 9 2235 71-9924", Instagram `https://www.instagram.com/traslados.mdp.ok/`, email vacío | Dígitos E.164: `5492235719924`. El formato habitual en MdP es característica 223 → "+54 9 223 571-9924" (D7). |

**No verificado:** la existencia de un dominio propio, si el negocio está registrado como agencia
de viajes, si hay testimonios reales y si hay Chrome instalado para correr Lighthouse local. Cada
uno tiene su decisión o su fallback.

---

## 3. Decisiones abiertas (resolver ANTES de la fase que bloquean)

| ID | Decisión | Quién decide | Default si no hay respuesta | Qué cambia según la respuesta | Bloquea |
|---|---|---|---|---|---|
| **D1** | Nombre comercial: "AT Turismo y Viajes" (pedido) o "A.T Turismo y Traslados" (logo) | Cliente / Gonzalo | "AT Turismo y Viajes" (lo pedido) | `businessName` en `contact.json`, `<title>`, `og:site_name`, `name` del JSON-LD y alt del logo. Si difiere del logo, Google y el usuario ven dos marcas. | B1 (se puede cambiar después: es un valor del JSON) |
| **D2** | **Hosting comercial**: la cuenta Vercel es Hobby, que según las Fair Use Guidelines (actualizadas el 2026-09-14) es "non-commercial personal use only" y cuenta como comercial "advertising the sale of a product or service". Opciones: (a) Vercel Pro (USD 20/mes), (b) team Pro del cliente, (c) otro host para sitios estáticos | **Gonzalo / cliente** (es decisión de costo y riesgo, no técnica) | **No pasar a producción** hasta decidir. Los previews para revisión interna sí se pueden hacer. | Quién paga, en qué team se crea el proyecto (`--scope`) y si G3 corre. | G3 |
| **D3** | ¿Dominio propio (`.com.ar`)? ¿Ya existe? | Cliente | `https://<proyecto>.vercel.app` | `siteUrl` → canonical, sitemap, OG y `@id` del JSON-LD. Si el dominio llega después: redirección 308 y actualizar `siteUrl` (G4). | G2/G4 |
| **D4** | Contenido real: lista de servicios (aeropuertos Ezeiza/Aeroparque/MDQ, terminales, puerta a puerta, excursiones, eventos…), destinos frecuentes, flota y capacidad, **máximo de pasajeros por pedido**, zona de cobertura, horario de atención, respuestas de la FAQ (equipaje, sillas para bebés, mascotas, formas de pago, cancelación, anticipación) | Cliente | Textos genéricos **marcados con `"TODO_CLIENTE"`** en `content.json`, máximo 20 pasajeros. El reviewer bloquea la producción si queda algún `TODO_CLIENTE`. | Contenido de D2–D5 y el `max` del formulario. | G3 (no bloquea el desarrollo) |
| **D4b** | "Fecha de llegada" en el formulario: ¿es la fecha de **regreso** (viaje de vuelta) o la de **llegada a destino**? | Cliente | Etiqueta "Fecha de regreso (opcional)" con ayuda "si es ida y vuelta" | La etiqueta, la validación (regreso ≥ salida) y el texto del mensaje de WhatsApp | B2 |
| **D4c** | Testimonios: ¿hay reseñas **reales** con permiso de publicación? | Cliente | **Sección oculta** (solo se ve la FAQ). Prohibido inventar testimonios. | Si hay reseñas, se muestran como texto. **Nunca** se marcan con `Review`/`AggregateRating`: Google no admite reseñas propias del negocio (self-serving) y puede penalizar. | D5 |
| **D5** | Habilitación legal: ¿es agencia de viajes registrada (Ley 18.829, legajo en el Ministerio de Turismo)? ¿El transporte tiene habilitación (CNRT / municipal)? | Cliente (consulta legal si duda) | Tipo `TravelAgency` en el JSON-LD (lo pedido). El texto visible habla de "traslados y viajes", **no** de "agencia de viajes". Campo `legal.license` vacío y oculto. | Si está registrada: se muestra el número de legajo en el footer (obligatorio para agencias). Si no lo está: conviene usar el tipo `LocalBusiness` y evitar "agencia" en los textos. | E5 y G3 |
| **D6** | Repo GitHub: nombre y visibilidad | Gonzalo | `gtorresgrau/at-turismo-mdp`, **privado** | Visibilidad del código. No hay secretos, pero el repo público expone el contenido `TODO_CLIENTE`. | G1 |
| **D7** | Cómo se muestra el teléfono: "+54 9 223 571-9924" (formato local estándar) o "+54 9 2235 71-9924" (como vino) | Cliente | "+54 9 223 571-9924" | Solo cambia `phone.display`. Los dígitos `5492235719924` no cambian. | — |
| **D8** | Activos gráficos: ¿hay logo en PNG/SVG **transparente** y fotos propias (vehículos, destinos)? | Cliente | Usar el JPG sobre fondos **negros** (navbar y hero oscuros). Hero sin foto: gradiente de marca + ola SVG animada inspirada en el logo. | Con PNG transparente hay más libertad de diseño. Con fotos propias el hero lleva imagen (cuidar el LCP con `next/image priority`). | — |

**Decisiones técnicas que tomo yo (con motivo, reversibles):**

| ID | Decisión | Motivo |
|---|---|---|
| T1 | Animaciones con **CSS + IntersectionObserver propio** (`Reveal.jsx`), sin `motion`/`framer-motion` | Es una landing: alcanza con fade/slide. 0 KB extra y control total de `prefers-reduced-motion`. Si más adelante se quiere algo complejo, se agrega `motion@14.9.0`. |
| T2 | Íconos con `lucide-react@1.66.0` y **SVG inline** para WhatsApp e Instagram | Lucide eliminó los íconos de marca (verificar en A3: si existen, igual se usa SVG propio para no depender de algo deprecado). |
| T3 | Tests de lógica pura con **`node --test`** (incluido en Node 24), sin Vitest | El único código con lógica real es el armado del mensaje, la validación y los helpers de contacto. Cero dependencias nuevas. **Por eso `src/lib/*` usa imports relativos, no `@/`**, porque Node no resuelve el alias. |
| T4 | Se mantiene `cacheComponents: true` del scaffold | Es el default de Next 16.4. La página es estática igual. Trae dos trampas que se resuelven en C2 y D6 (ver R3). |
| T5 | La metadata SEO vive en `src/lib/seo.js` y `layout.js` solo la importa | Así Frontend y SEO no editan el mismo bloque de `layout.js` en paralelo. |
| T6 | Contenido editable separado: `src/data/contact.json` (contacto) y `src/data/content.json` (textos de las secciones) | Es lo pedido (todo el contacto en un JSON) y además los textos del cliente se cambian sin tocar JSX. |

---

## 4. Arquitectura objetivo

```
D:\WEBS\Turismo
├─ CLAUDE.md                     # reglas del proyecto para los agentes (A2)
├─ AGENTS.md                     # generado por Next, NO borrar
├─ PLAN.md                       # este archivo
├─ scripts/generate-brand-assets.mjs   # sharp: íconos + OG desde el logo (E2)
├─ tests/*.test.mjs              # node --test (B1, B2)
├─ public/brand/logo.jpg         # original intacto (A1)
└─ src/
   ├─ app/
   │  ├─ layout.js               # html lang="es-AR", fuentes, skip link, Navbar/Footer/WhatsAppFloat, JsonLd
   │  ├─ page.js                 # compone las secciones
   │  ├─ globals.css             # @import "tailwindcss"; @theme con tokens de marca; keyframes; reduced-motion
   │  ├─ icon.png  apple-icon.png  opengraph-image.jpg  (+ .alt.txt)   # generados (E2)
   │  ├─ robots.js  sitemap.js  manifest.js                            # E4
   │  └─ not-found.js
   ├─ components/
   │  ├─ layout/  Navbar.jsx  Footer.jsx  WhatsAppFloat.jsx
   │  ├─ sections/ Hero.jsx  Services.jsx  HowItWorks.jsx  WhyUs.jsx  Faq.jsx  Testimonials.jsx  Contact.jsx  QuoteForm.jsx
   │  ├─ ui/  Container.jsx  Section.jsx  SectionHeading.jsx  ButtonLink.jsx  Reveal.jsx  BrandIcons.jsx  FormField.jsx
   │  └─ seo/ JsonLd.jsx
   ├─ data/  contact.json  content.json
   └─ lib/   contact.js  whatsapp.js  validateQuote.js  seo.js  jsonld.js
```

**Contrato de `src/data/contact.json`** (B1). Regla: **string vacío = no se muestra en ningún
lado y no se emite en el JSON-LD.**

```json
{
  "businessName": "AT Turismo y Viajes",
  "shortName": "AT Turismo",
  "tagline": "Traslados y viajes desde Mar del Plata",
  "description": "…(≤160 caracteres, sirve de meta description)…",
  "siteUrl": "https://at-turismo-mdp.vercel.app",
  "locale": "es-AR",
  "phone": { "display": "+54 9 223 571-9924", "e164": "+5492235719924" },
  "whatsapp": { "number": "5492235719924", "defaultMessage": "¡Hola! Quiero hacer una consulta." },
  "email": "",
  "instagram": { "user": "traslados.mdp.ok", "url": "https://www.instagram.com/traslados.mdp.ok/" },
  "address": { "street": "", "locality": "Mar del Plata", "region": "Buenos Aires", "postalCode": "", "country": "AR" },
  "areaServed": ["Mar del Plata", "TODO_CLIENTE"],
  "openingHours": [],
  "legal": { "license": "" }
}
```

---

## 5. Fases y tareas

Convenciones: **F** = Agente-Frontend (puede delegar a FrontendJr las tareas `facil` marcadas con *).
**S** = Agente-SEO. **R** = Agente-reviewer. Cada fase termina con un commit local
(`git commit`), así un corte a mitad de camino deja un estado consistente.

### Fase A — Scaffold y fundaciones (todo reversible: se borra la carpeta y listo)
**Objetivo cumplido cuando:** `npm run build` y `npm run lint` pasan sobre el scaffold limpio, con
tokens de marca y `CLAUDE.md`, y el logo está preservado.

| ID | Tarea | Nivel | Quién | Archivos | Depende | Criterio de hecho |
|---|---|---|---|---|---|---|
| A1 | Scaffold: mover `Logo.jpg` a una carpeta temporal fuera del proyecto, correr `npx create-next-app@16.4.3 . --js --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --no-agent-feedback --yes` (**con** git), crear `public/brand/` y devolver el logo como `public/brand/logo.jpg` | facil | F | todo el scaffold | — | `public/brand/logo.jpg` pesa exactamente 22.878 bytes. `npm run build` termina en 0. `git log` muestra el commit inicial. No queda `Logo.jpg` suelto en la raíz ni en la carpeta temporal. |
| A2 | `CLAUDE.md` del proyecto: stack exacto (Next 16.4.3, React 19.3, Tailwind 4 CSS-first, JS sin TS), "leer `AGENTS.md` y `node_modules/next/dist/docs/` antes de usar una API", regla "contacto solo desde `contact.json`", dependencias permitidas (solo `lucide-react`), cómo correr `npm test`, propiedad de archivos (T5) | facil | Lider redacta, F commitea | `CLAUDE.md` | A1 | El archivo existe, cubre esos 6 puntos y no menciona hcdigital ni AgendaProMed. |
| A3 | Limpieza y tokens: borrar el boilerplate (`public/*.svg`, contenido de `page.js`, bloque dark-mode del CSS). Medir los colores del logo con un script sharp de una sola vez. Definir `@theme` (`--color-brand-navy`, `--color-brand-blue`, `--color-brand-gold`, `--color-ink`…). Elegir fuentes con `next/font/google` (display serif/sans que acompañe al "A.T" + sans de texto). Instalar `lucide-react@1.66.0` y verificar si trae íconos de marca (T2). Agregar `"test": "node --test tests/"` | media | F | `globals.css`, `layout.js`, `page.js`, `package.json` | A1 | Lint y build en verde. Los hex de marca quedan documentados en un comentario de `globals.css` con su origen. **Tabla de contraste** en el commit: cada par texto/fondo usado ≥ 4.5:1 (≥ 3:1 en texto grande). `rg "next.svg\|vercel.svg" src` → 0 resultados. |

### Fase B — Datos y lógica pura (sin UI; se prueba con `node --test`)
**Objetivo cumplido cuando:** `npm test` está en verde y cubre helpers, validación y mensaje.

| ID | Tarea | Nivel | Quién | Archivos | Depende | Criterio de hecho |
|---|---|---|---|---|---|---|
| B1 | `contact.json` (contrato §4) + `content.json` (servicios, pasos, ventajas, FAQ, testimonios `[]`, con `TODO_CLIENTE` donde falte D4). `lib/contact.js`: `waLink(text?)`, `telHref()`, `instagramUrl()`, `hasValue()` y `assertContact()`, que **lanza en build** si falta `businessName`, si `whatsapp.number` no es solo dígitos (10–15) o si `siteUrl` no es `https://…` sin barra final | media | F | `src/data/*.json`, `src/lib/contact.js`, `tests/contact.test.mjs` | A3, D1 (con default) | `npm test` pasa con ≥ 6 casos: `waLink()` → `https://wa.me/5492235719924` (sin `+`), texto con `&`, `#` y salto de línea correctamente codificado, `assertContact` lanza con un número que tiene `+` o espacios, y lanza con `siteUrl` terminada en `/`. |
| B2 | `lib/validateQuote.js` y `lib/whatsapp.js` (`buildQuoteMessage`). **Funciones puras**: `today` (`YYYY-MM-DD`) entra como parámetro, no se calcula adentro. Reglas: origen, destino, salida, horario, pasajeros, nombre y teléfono obligatorios. Salida ≥ hoy. Regreso opcional ≥ salida (D4b). Pasajeros entero de 1 a `max`. Si `incluyeMenores`, menores entero de 1 a pasajeros. Teléfono 8–15 dígitos (admite `+ - ( )` y espacios). Observaciones ≤ 500 caracteres. Mensaje: fechas en `DD/MM/AAAA`, líneas omitidas si están vacías y el saludo con el nombre | media | F | `src/lib/validateQuote.js`, `src/lib/whatsapp.js`, `tests/quote.test.mjs` | B1, D4b (con default) | `npm test` pasa con ≥ 12 casos, incluidos: sin regreso (la línea no aparece), menores=sí sin cantidad (error), menores > pasajeros (error), regreso < salida (error), salida ayer (error), observaciones con emoji y `&` (URL válida y decodificable de vuelta al mismo texto), URL final < 2000 caracteres con todos los campos al máximo. |

### Fase C — Base de UI y layout
**Objetivo cumplido cuando:** la página vacía tiene Navbar, Footer y botón flotante funcionando con
teclado, y `Reveal` respeta reduced-motion y no-JS.

| ID | Tarea | Nivel | Quién | Archivos | Depende | Criterio de hecho |
|---|---|---|---|---|---|---|
| C1 | Primitivas UI: `Container`, `Section` (`id` + `aria-labelledby`), `SectionHeading`, `ButtonLink` (siempre `<a>`, nunca `<button>` dentro de `<a>`), `BrandIcons` (SVG WhatsApp/Instagram con `aria-hidden`), `Reveal` (client, IntersectionObserver, `once`). **Mejora progresiva**: el estado oculto solo aplica si hay JS (clase `js` en `<html>` puesta con un script inline mínimo o el patrón equivalente documentado en Next 16). Con `prefers-reduced-motion: reduce` el contenido aparece sin transform ni transición | media | F | `src/components/ui/*`, `globals.css` | A3 | (1) Con JS deshabilitado en el navegador todo el texto es visible. (2) Con reduced-motion emulado en DevTools no hay `transform` animado (se ve en Performance o en estilos computados). (3) `npm run build` sin warnings de hidratación en la consola de `next start`. |
| C2 | Layout: `<html lang="es-AR">`, skip link "Saltar al contenido", `<main id="contenido">`. **Navbar** oscura (el logo JPG sobre negro, D8), sticky, menú mobile con `aria-expanded`/`aria-controls`, cierra con Esc y al elegir un link, foco visible, anclas a `#servicios #como-funciona #por-que #faq #cotizar`, `scroll-margin-top` para que la navbar no tape. **Footer**: todo desde `contact.json`, email/licencia solo si `hasValue`. **Año**: no usar `new Date()` en el render del server sin verificar el comportamiento con `cacheComponents` (R3); alternativa: valor de build o `'use cache'`. **WhatsAppFloat**: `<a>` a `waLink(defaultMessage)`, `aria-label`, `target="_blank" rel="noopener noreferrer"`, respeta `env(safe-area-inset-bottom)`, no tapa el botón de envío del formulario en 360px | media | F | `src/app/layout.js`, `src/components/layout/*` | C1, B1 | Recorrido solo con teclado: Tab llega al skip link primero y Enter salta a `main`. Menú mobile abre/cierra con Enter y Esc, y el foco vuelve al botón. `rg -n "5492235719924\|571-9924\|traslados.mdp" src --glob '!src/data/contact.json'` → **0 resultados**. A 360px de ancho no hay scroll horizontal. |

### Fase D — Secciones
**Objetivo cumplido cuando:** la página completa renderiza desde `content.json`/`contact.json` y la
cotización abre WhatsApp con el mensaje correcto.

| ID | Tarea | Nivel | Quién | Archivos | Depende | Criterio de hecho |
|---|---|---|---|---|---|---|
| D1 | **Hero**: un `<h1>` único con el valor de la marca, subtítulo, CTAs "Cotizar viaje" (`#cotizar`) y "WhatsApp". Animación CSS: ola SVG con movimiento lento + entrada escalonada. **El `<h1>` NO arranca en `opacity:0`** (retrasaría el LCP): se anima solo con transform corto, o se animan los elementos secundarios. Todo se desactiva con reduced-motion | facil* | F | `sections/Hero.jsx`, `globals.css` | C2 | Hay exactamente 1 `<h1>` en el HTML de `/`. Con reduced-motion no se mueve nada. LCP mobile ≤ 2.5 s en G3. |
| D2 | **Servicios**: grilla de cards desde `content.services` (ícono lucide, título `<h3>`, texto) con `Reveal` | facil* | F | `sections/Services.jsx` | C1, B1 | Las cards salen del JSON: agregar un ítem al JSON agrega una card sin tocar JSX. 1/2/3 columnas en 360/768/1280 px. |
| D3 | **Cómo funciona / Destinos**: pasos numerados (`<ol>`) + chips de destinos frecuentes | facil* | F | `sections/HowItWorks.jsx` | C1, B1 | Usa `<ol>` semántico. Los contenidos salen del JSON. |
| D4 | **Por qué elegirnos**: ventajas con ícono | facil* | F | `sections/WhyUs.jsx` | C1, B1 | Ídem D2. Ningún texto hardcodeado en el JSX (`rg` de strings de >20 caracteres en `sections/WhyUs.jsx` → solo `className`s). |
| D5 | **FAQ** con `<details>/<summary>` nativo (accesible sin JS) + **Testimonios** condicional (solo si `content.testimonials.length > 0`, D4c) | facil* | F | `sections/Faq.jsx`, `sections/Testimonials.jsx` | C1, B1 | Con `testimonials: []` la sección y su link en la navbar no existen en el HTML. La FAQ abre y cierra con teclado. |
| D6 | **Contacto + QuoteForm** (client). Campos: origen, destino, fecha de salida (`type=date`), fecha de llegada/regreso opcional, horario (`type=time`), pasajeros (`number`), "¿Viajan menores?" (sí/no) → cantidad de menores (solo aparece si es sí), observaciones (`textarea`, contador de 500), nombre y teléfono (`type=tel`, `autocomplete="tel"`). Cada campo con `<label>` visible, `required` y `aria-required`, error con `aria-invalid` + `aria-describedby`, y resumen de errores con foco al enviar. `min` de las fechas calculado **en el cliente** (en un efecto o en el handler, no en el render: evita el mismatch de hidratación y el error de `cacheComponents`, R3). Al enviar válido: `window.open(url, "_blank", "noopener")` **dentro del mismo handler del submit** (gesto del usuario). Si devuelve `null` (bloqueado), mostrar un link "Abrir WhatsApp" con la misma URL. **No se guarda nada** (ni localStorage). Al lado del formulario: teléfono (`tel:`), WhatsApp, Instagram y email si hay | media | F | `sections/Contact.jsx`, `sections/QuoteForm.jsx`, `ui/FormField.jsx` | B2, C1 | (1) Enviar vacío → el foco va al resumen de errores y cada campo inválido tiene `aria-invalid="true"`. (2) Caso feliz → se abre `https://wa.me/5492235719924?text=…` y el texto decodificado coincide con lo que da `buildQuoteMessage` (el reviewer lo compara a mano en un caso). (3) "Menores: no" → el campo de cantidad no está en el DOM. (4) Sin warnings de hidratación. (5) Funciona en móvil real: abre la app de WhatsApp (prueba manual del dueño en G3). |

### Fase E — SEO técnico (Agente-SEO; puede arrancar en paralelo con C/D apenas exista B1)
**Objetivo cumplido cuando:** `/` expone metadata completa, canonical, OG, íconos, robots, sitemap y
JSON-LD válidos, todos derivados de `contact.json`.

| ID | Tarea | Nivel | Quién | Archivos | Depende | Criterio de hecho |
|---|---|---|---|---|---|---|
| E1 | `lib/seo.js` exporta `metadata` y `viewport`: `metadataBase: new URL(siteUrl)`, `title` (default + template), `description`, `alternates.canonical: "/"`, `openGraph` (`type website`, `locale es_AR`, `siteName`, `url`), `twitter.card summary_large_image`, `robots index/follow`, `formatDetection.telephone` y `themeColor` en `viewport`. `layout.js` solo hace `export { metadata, viewport } from "@/lib/seo"` (T5). Revisar en `node_modules/next/dist/docs/` la API de metadata de 16.4 | media | S | `src/lib/seo.js`, una línea de `layout.js` | B1, A3 | En el HTML de `next start`: `<link rel="canonical" href="{siteUrl}">` (sin `/` doble), `og:locale=es_AR`, `og:url`, `og:image` absoluto, `<html lang="es-AR">`, title ≤ 60 caracteres y description de 120–160. Cambiar `siteUrl` en el JSON cambia el canonical sin tocar código. |
| E2 | `scripts/generate-brand-assets.mjs` (sharp, ya disponible vía Next): genera `src/app/icon.png` (512), `src/app/apple-icon.png` (180, fondo negro) y `src/app/opengraph-image.jpg` (1200x630: el logo centrado sobre negro, ≤ 300 KB) + `opengraph-image.alt.txt`. Borrar el `favicon.ico` del scaffold (o regenerarlo). Se corre a mano y **los resultados se commitean** (el build de Vercel no depende de sharp). Evaluar si a 32 px el logo completo es legible; si no, recortar a corona + "A.T" para el ícono (decisión visual: se documenta y el dueño puede objetar) | media | S | `scripts/…`, `src/app/icon.png`, `apple-icon.png`, `opengraph-image.*` | A1 | `node scripts/generate-brand-assets.mjs` es idempotente. El HTML trae `<link rel="icon">` y `apple-touch-icon` apuntando a los archivos nuevos. Ya no está el ícono de Next. `/opengraph-image.jpg` responde 200 con 1200x630. |
| E3 | `manifest.js` (name, short_name, `lang es-AR`, `theme_color`, íconos) | facil | S | `src/app/manifest.js` | E2, B1 | `/manifest.webmanifest` responde 200 y los íconos que lista existen. |
| E4 | `robots.js` (`allow: /`, `sitemap: {siteUrl}/sitemap.xml`, `host`) y `sitemap.js` (una URL: `siteUrl`, `lastModified`, `changeFrequency monthly`, `priority 1`). **Si el deploy no es producción** (`VERCEL_ENV !== "production"`), robots devuelve `disallow: /` para que no se indexen los previews | facil | S | `src/app/robots.js`, `src/app/sitemap.js` | B1 | `/robots.txt` en producción tiene `Sitemap: https://…/sitemap.xml`. En un preview de Vercel tiene `Disallow: /`. `/sitemap.xml` es XML válido con 1 `<url>`. |
| E5 | `lib/jsonld.js` + `components/seo/JsonLd.jsx`: `@graph` con `TravelAgency` (o `LocalBusiness` según D5; `@id: {siteUrl}#business`, `name`, `url`, `logo`, `image` = OG, `telephone` = e164, `sameAs` = [instagram], `address` PostalAddress con solo los campos que tengan valor, `areaServed` como `City`, `openingHoursSpecification` si hay, `email` solo si no está vacío, `priceRange` solo si el cliente lo da) + `WebSite` (`@id #website`, `inLanguage es-AR`, `publisher` → business). Serializar escapando `<` como `\u003c`. **Sin** `Review`/`AggregateRating` (D4c). **Sin** `FAQPage` (Google lo limitó a sitios de gobierno y salud: no da rich result) | media | S | `src/lib/jsonld.js`, `src/components/seo/JsonLd.jsx`, `tests/jsonld.test.mjs`, montaje en `layout.js` | B1, D5 (con default) | `npm test`: con `email: ""` la clave `email` no existe en el objeto; `telephone === contact.phone.e164`; `sameAs` incluye la URL de Instagram. Post-deploy (G3): Rich Results Test y validator.schema.org **sin errores** (warnings documentados). |

### Fase F — Verificación pre-deploy (Agente-reviewer; no corrige, deriva)
**Objetivo cumplido cuando:** el reviewer emite un informe con todo verificado ejecutando y cero
hallazgos bloqueantes.

| ID | Tarea | Nivel | Quién | Depende | Criterio de hecho |
|---|---|---|---|---|---|
| F1 | Corre `npm run lint`, `npm test`, `npm run build` (la ruta `/` tiene que salir **estática/prerenderizada**) y `npm start` + `curl` a `/`, `/robots.txt`, `/sitemap.xml`, `/manifest.webmanifest`, `/icon.png`, `/opengraph-image.jpg` | media | R | A–E | Los 3 comandos terminan en 0. Los 6 `curl` devuelven 200. La salida queda pegada en el informe. |
| F2 | Chequea cada criterio de hecho de A–E, uno por uno, y marca cada uno como "verificado ejecutando" o "leído". `rg` de datos de contacto fuera de `contact.json` (C2). `rg TODO_CLIENTE src/data` (si hay resultados, se listan como **bloqueante para G3** y no para G2). Prueba de teclado, no-JS, reduced-motion y 360/768/1280 px | media | R | F1 | Informe con hallazgos clasificados (bloqueante / menor) y derivados: UI → Agente-Frontend, metadata/JSON-LD → Agente-SEO. |
| F3 | Lighthouse local (`npx lighthouse http://localhost:3000 --preset=desktop` y mobile) **si hay Chrome**. Si no hay, se marca como no verificado y se hace en G3 con PageSpeed Insights | facil | R | F1 | Accesibilidad ≥ 95, SEO ≥ 95 (local puede marcar el canonical a un dominio distinto: se acepta y se aclara), Best Practices ≥ 95, Performance mobile ≥ 90. |

### Fase G — GitHub y Vercel
**Objetivo cumplido cuando:** el repo existe, Vercel despliega desde GitHub y la URL final pasa las
verificaciones post-deploy.

| ID | Tarea | Nivel | Quién | Depende | Criterio de hecho |
|---|---|---|---|---|---|
| G1 | `gh repo create gtorresgrau/<D6> --private --source . --remote origin --push` (desde `D:\WEBS\Turismo`). Antes: `git status` limpio y verificar que no se versionen `.env*`, `.vercel` ni `node_modules` | facil | F (ejecuta), R (verifica) | F sin bloqueantes, D6 | `gh repo view gtorresgrau/<D6> --json visibility,defaultBranchRef` muestra lo esperado. `git ls-files \| rg "^(\.env\|\.vercel\|node_modules)"` → 0 resultados. |
| G2 | **Preview** en Vercel: `vercel link --yes --project <D6>` en el scope que diga D2, `vercel git connect` (deploy automático desde GitHub) y primer `vercel` (preview). Si D3 = sin dominio, ajustar `siteUrl` a la URL de producción que va a tener el proyecto (`<proyecto>.vercel.app`, revisar que esté libre), commit y push | media | F | G1 | Hay una URL de preview que responde 200. `robots.txt` del preview dice `Disallow: /` (E4). El push a `main` dispara un build en Vercel (se ve en `vercel ls`). |
| G3 | **Producción**: `vercel --prod` o promover el preview. **Bloqueada por D2** (plan comercial) y por la ausencia de `TODO_CLIENTE` (D4). Después, Agente-SEO verifica: PageSpeed Insights mobile/desktop, Rich Results Test, `curl -s {siteUrl} \| rg 'og:\|canonical\|ld\+json'` y la previsualización del link compartido en WhatsApp. El dueño prueba el formulario en un celular real | **dificil** (decisión de negocio, D2) | F despliega, S verifica, R cierra | G2, D2, D4 | La URL de producción responde 200. El canonical, el `og:url` y el `@id` coinciden con la URL real. El JSON-LD no tiene errores. PSI mobile: Performance ≥ 90 y Accesibilidad/SEO ≥ 95. El mensaje llega a `+54 9 223 571-9924` desde un celular real. |
| G4 | (Condicional, D3) Dominio propio: alta en Vercel, DNS, redirección 308 de `*.vercel.app` → dominio, `siteUrl` actualizado y redeploy. **Si el dominio ya tiene correo (MX), no tocar esos registros** | **dificil** (DNS mal tocado = mail o sitio caídos; propagación lenta para revertir) | F + S | G3, D3 | `curl -I https://<proyecto>.vercel.app` → 308 al dominio. El canonical apunta al dominio. Los registros MX previos siguen intactos (`nslookup -type=mx` antes y después). |
| G5 | (Opcional) Search Console: verificar la propiedad y enviar el sitemap. Google Business Profile lo gestiona el cliente | media | S + dueño | G3 (idealmente G4) | La propiedad está verificada y el sitemap figura como "Correcto" en GSC. |

---

## 6. Riesgos

| ID | Riesgo | Cómo se detecta | Cómo se mitiga / revierte |
|---|---|---|---|
| R1 | **Uso comercial en Vercel Hobby** (ToS): pueden pausar el proyecto | Se sabe de antemano (§2) | D2 antes de G3. Los previews internos no exponen el sitio al público. |
| R2 | Los agentes asumen Next 15 / Tailwind 3 (sus definiciones son de AgendaProMed: hcdigital, "nunca `npm install`", presupuesto de lint de 352) y escriben `tailwind.config.js`, `next lint` o APIs viejas | `tailwind.config.*` en el repo, `next lint` en scripts, errores de build | §8: el prompt de cada agente sobreescribe el contexto. `CLAUDE.md` (A2). El reviewer chequea que no exista `tailwind.config.*`. |
| R3 | `cacheComponents: true` + `new Date()` en el render (año del footer, `min` de fechas) → error de prerender o mismatch de hidratación. **No lo verifiqué ejecutando**: es una sospecha por cómo funciona `cacheComponents` | `npm run build` falla, o warning de hidratación en la consola | Calcular la fecha en el cliente después del mount o en el handler (D6). Para el año: valor de build o `'use cache'` según `node_modules/next/dist/docs/`. Último recurso: `cacheComponents: false` (T4 es reversible). |
| R4 | `Reveal` deja contenido invisible sin JS o para los crawlers | F2: prueba con JS deshabilitado. Ver el HTML del server con `curl` | Mejora progresiva (C1): oculto solo si hay JS. |
| R5 | El navegador bloquea el popup de WhatsApp | Prueba manual en Safari iOS y Chrome | `window.open` dentro del gesto + link de fallback visible (D6). |
| R6 | Mensaje demasiado largo para `wa.me` | Test de B2 (< 2000 caracteres) | Tope de 500 caracteres en observaciones. |
| R7 | El logo JPG con fondo negro queda feo sobre fondos claros, o el ícono no se lee a 32 px | Revisión visual en F2 | Diseño oscuro en navbar/hero (D8). Recorte del ícono (E2). Pedir PNG transparente al cliente. |
| R8 | Contraste insuficiente (azul marino del logo sobre negro) | Tabla de A3 y Lighthouse | Usar el marino solo sobre fondos claros. Sobre negro, texto blanco o dorado. |
| R9 | Se indexa un preview o la URL `vercel.app` antes que el dominio y quedan duplicados | `site:vercel.app` en Google | robots condicional (E4). Canonical a `siteUrl`. 308 en G4. |
| R10 | Se publican textos `TODO_CLIENTE` o testimonios inventados | `rg TODO_CLIENTE` en F2 | Bloquea G3 (D4/D4c). |
| R11 | Claims legales ("agencia de viajes") sin habilitación | D5 | Texto neutro por default. Decide el cliente. |
| R12 | Que Frontend y SEO editen `layout.js` al mismo tiempo genera conflictos | Diff y merge | T5: SEO solo toca `lib/seo.js`, `lib/jsonld.js` y una línea de import/montaje. Si trabajan en paralelo, cada uno en su rama y el merge lo hace F. |

**Vuelta atrás general:** hasta G1 todo es local (se borra la carpeta o se hace `git reset` al
commit de la fase anterior). Después de G3, un deploy malo se revierte con `vercel rollback` o
promoviendo el deployment anterior. Lo único con inercia es G4 (DNS) y la indexación.

---

## 7. Orden sugerido y paralelización

```
A1 → A2 ┐
     A3 ┴→ B1 → B2 ─────────────┐
            │                    ├→ D6
            ├→ C1 → C2 → D1..D5 ─┤   (D1–D5 en paralelo entre sí; candidatas a FrontendJr)
            └→ E1, E2→E3, E4, E5 ┘   (Agente-SEO, en paralelo con C/D)
                                 ↓
                         F1 → F2 → F3 (reviewer)
                                 ↓
                         G1 → G2 → [D2, D4 resueltas] → G3 → (G4) → (G5)
```

- **Mandar ya al cliente:** D1, D2, D3, D4/D4b/D4c, D5, D7 y D8. Ninguna bloquea A–F (todas
  tienen default), pero **D2 y D4 bloquean la producción**.
- **Puntos de corte seguros:** el final de cada fase, con su commit. Si se corta entre G2 y G3,
  queda un preview no indexable y nada público.
- **Estimación gruesa:** A ≈ 1 h · B ≈ 1,5 h · C ≈ 2 h · D ≈ 3–4 h · E ≈ 2 h · F ≈ 1 h · G1–G2 ≈ 0,5 h.
  G3 depende de las decisiones.

---

## 8. Aviso obligatorio para el prompt de cada agente

Las definiciones de Agente-Frontend, FrontendJr, SEO y reviewer están escritas para
**AgendaProMed** (hcdigital, Next 15, Tailwind 3, datos de salud, "nunca `npm install`" y
presupuesto de lint de 352). Al derivarles una tarea de este plan, el prompt **tiene que** incluir:

1. Repo: `D:\WEBS\Turismo`. No es AgendaProMed: no hay datos de salud, cookies, auth ni backend.
2. Stack: **Next 16.4.3 (App Router, `cacheComponents: true`), React 19.3, Tailwind 4 CSS-first
   (`@theme` en `globals.css`, sin `tailwind.config.js`), JavaScript (sin TS), ESLint 9 flat
   (`npm run lint` = `eslint`)**. Leer `AGENTS.md`, `CLAUDE.md` y la guía correspondiente en
   `node_modules/next/dist/docs/` antes de usar una API.
3. Dependencias: solo las del scaffold + `lucide-react`. Cualquier otra se pide a quien coordina.
4. Contacto: **solo** desde `src/data/contact.json` vía `src/lib/contact.js`.
5. La tarea exacta (ID), sus archivos y su criterio de hecho copiados de este plan.
6. Para el reviewer: lo que tiene que **ejecutar** (F1–F3) y a quién derivar cada hallazgo.
