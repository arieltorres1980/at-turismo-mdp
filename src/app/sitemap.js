import { contact } from "@/lib/contact";

/**
 * sitemap.xml (E4): una sola URL. Sin `lastModified`: con `cacheComponents`
 * no se puede usar `new Date()` en el prerender, y una fecha inventada es peor
 * que omitirla.
 */
export default function sitemap() {
  return [{ url: contact.siteUrl, changeFrequency: "monthly", priority: 1 }];
}
