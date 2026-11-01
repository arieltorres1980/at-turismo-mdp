import { Inter, Playfair_Display } from "next/font/google";

import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import WhatsAppFloat from "@/components/layout/WhatsAppFloat";
import JsonLd from "@/components/seo/JsonLd";
import { contact, waLink } from "@/lib/contact";
import { navItems } from "@/lib/navigation";
import "./globals.css";

const body = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

const display = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

export { metadata, viewport } from "@/lib/seo";

/**
 * Marca el documento como "con JavaScript" antes del primer paint.
 * El estado oculto de `Reveal` cuelga de `.js` en globals.css, asi que sin JS
 * no se oculta nada (mejora progresiva, R4 del PLAN).
 */
const JS_FLAG = "document.documentElement.classList.add('js');";

export default function RootLayout({ children }) {
  const items = navItems();

  return (
    <html
      lang="es-AR"
      className={`${body.variable} ${display.variable} h-full antialiased`}
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
    </html>
  );
}
