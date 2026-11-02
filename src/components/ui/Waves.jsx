const PATH =
  "M0,64 C180,110 320,10 540,46 C760,82 900,118 1120,86 C1280,62 1370,34 1440,20 L1440,120 L0,120 Z";

function Band({ className }) {
  return (
    <svg
      viewBox="0 0 1440 120"
      preserveAspectRatio="none"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path d={PATH} fill="currentColor" />
    </svg>
  );
}

/**
 * Olas del hero, inspiradas en la ola del isologo.
 *
 * Cada capa son dos copias del mismo trazo, una al lado de la otra dentro de
 * un contenedor del doble de ancho; la animacion `wave` lo desplaza un 50 %,
 * asi que el bucle es continuo. Es CSS puro: 0 KB de JavaScript.
 *
 * `prefers-reduced-motion: reduce` detiene la animacion (globals.css).
 */
export default function Waves({ className = "" }) {
  const layers = [
    { color: "text-brand-gold/30", height: "h-14 sm:h-20 lg:h-28", animation: "animate-wave-slower", offset: "bottom-3 sm:bottom-5" },
    { color: "text-brand-blue/40", height: "h-14 sm:h-20 lg:h-28", animation: "animate-wave-slow", offset: "bottom-1.5 sm:bottom-2.5" },
    { color: "text-surface", height: "h-12 sm:h-16 lg:h-24", animation: "animate-wave-slower", offset: "bottom-0" },
  ];

  return (
    <div id="waves" className={`pointer-events-none absolute inset-x-0 bottom-0 overflow-hidden ${className}`} aria-hidden="true" >
      {layers.map((layer) => (
        <div key={layer.color} className={`absolute inset-x-0 flex w-[200%] ${layer.offset} ${layer.animation}`} >
          <Band className={`w-1/2 ${layer.height} ${layer.color}`} />
          <Band className={`w-1/2 ${layer.height} ${layer.color}`} />
        </div>
      ))}
      {/* Reserva de alto: las capas van en posicion absoluta. */}
      <div className="h-12 sm:h-16 lg:h-24" />
    </div>
  );
}
