import { contact } from "@/lib/contact";

/**
 * robots.txt (E4). Solo la produccion de Vercel es indexable: previews y
 * deploys de desarrollo devuelven `Disallow: /` (R9). Fuera de Vercel
 * (`VERCEL_ENV` ausente, ej. `npm start` local) tambien se bloquea.
 * Se evalua en build, y Vercel fija `VERCEL_ENV` por deployment.
 */
export default function robots() {
  if (process.env.VERCEL_ENV !== "production") {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${contact.siteUrl}/sitemap.xml`,
    host: contact.siteUrl,
  };
}
