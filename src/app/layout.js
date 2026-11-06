import { GoogleTagManager } from "@next/third-parties/google";
import { Inter, Playfair_Display } from "next/font/google";

import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import WhatsAppFloat from "@/components/layout/WhatsAppFloat";
import JsonLd from "@/components/seo/JsonLd";
import content from "@/data/content.json";
import { contact, waLink } from "@/lib/contact";
import { getEvents } from "@/lib/events-source";
import { navItems } from "@/lib/navigation";
import "./globals.css";

/**
 * Tipografias.
 *
 * `preload: true` (el default, explicito para que no se pierda en un refactor)
 * mas `subsets: ["latin"]` hace que Next emita el `Link: rel=preload` del
 * archivo latino de cada familia, asi el navegador los pide junto con el HTML
 * y no despues de parsear el CSS.
 *
 * Inter queda variable: el texto del sitio usa 400, 500 y 600, y tres archivos
 * estaticos pesan mas que el unico variable.
 *
 * Playfair se limita a `700 normal`, el unico corte que usa la UI (todos los
 * `font-display` del proyecto van con `font-bold`, no hay italicas). Eso
 * cambia el archivo variable por el estatico de 700 y baja los bytes que
 * bloquean el pintado del `<h1>`, que es el LCP.
 */
const body = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const display = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "700",
  style: "normal",
  display: "swap",
  preload: true,
});

export { metadata, viewport } from "@/lib/seo";

/**
 * Marca el documento como "con JavaScript" antes del primer paint.
 * El estado oculto de `Reveal` cuelga de `.js` en globals.css, asi que sin JS
 * no se oculta nada (mejora progresiva, R4 del PLAN).
 */
/**
 * Google Tag Manager. GA4 y el resto de las etiquetas se configuran dentro del
 * contenedor GTM, no en el codigo. Solo se carga en produccion de Vercel:
 * previews y desarrollo no ensucian las metricas. Se puede pisar el ID con
 * `NEXT_PUBLIC_GTM_ID`.
 */
const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID || "GTM-THFWC2RK";
const GTM_ACTIVO = process.env.VERCEL_ENV === "production";

const JS_FLAG = "document.documentElement.classList.add('js');";

export default async function RootLayout({ children }) {
  // El link "#eventos" tiene que reflejar la MISMA fuente que la seccion (la
  // Google Sheet si esta configurada), no el events.json del build. `getEvents`
  // esta cacheado, asi que esto no agrega un segundo pedido a la hoja.
  const items = navItems(content, await getEvents());

  return (
    // `suppressHydrationWarning`: el script JS_FLAG agrega la clase `js` a <html>
    // antes de hidratar, asi que el className del cliente difiere del del
    // servidor a proposito. Solo silencia los atributos de este elemento.
    <html
      lang="es-AR"
      className={`${body.variable} ${display.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col bg-surface text-ink">
        <script dangerouslySetInnerHTML={{ __html: JS_FLAG }} />

        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-60 focus:rounded-full focus:bg-brand-gold focus:px-5 focus:py-3 focus:font-semibold focus:text-brand-black"
        >
          Saltar al contenido
        </a>

        <Navbar
          items={items}
          businessName={contact.businessName}
          whatsappHref={waLink(contact.whatsapp.defaultMessage)}
          ctaLabel="WhatsApp"
        />

        <main id="contenido" className="flex-1">
          {children}
        </main>

        <Footer items={items} />
        <WhatsAppFloat />
        <JsonLd />
      </body>
      {GTM_ACTIVO ? <GoogleTagManager gtmId={GTM_ID} /> : null}
    </html>
  );
}
