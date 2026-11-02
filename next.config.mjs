import { PATRONES_BANNER_REMOTO } from "./src/lib/banner-hosts.js";

/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    /**
     * Banners de eventos cargados como URL en la Google Sheet.
     *
     * La lista NO se escribe aca: sale de `src/lib/banner-hosts.js`, el mismo
     * modulo que usa el parser para aceptar o rechazar la celda Banner. Si
     * estuvieran en dos lados, un host habilitado en el parser y no aca daria
     * un 400 del optimizador en produccion.
     *
     * Son solo los hosts de imagenes de Google Drive:
     *   https://lh3.googleusercontent.com/d/<ID>          (forma directa)
     *   https://drive.google.com/uc?export=view&id=<ID>
     * El link que copia Drive (https://drive.google.com/file/d/<ID>/view) se
     * reescribe a la primera forma en el parser: esa URL es una pagina HTML.
     */
    remotePatterns: PATRONES_BANNER_REMOTO,
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
