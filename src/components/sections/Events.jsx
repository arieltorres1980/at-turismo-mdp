"use client";

import Image from "next/image";
import { CalendarDays, Clock } from "lucide-react";

import Reveal from "@/components/ui/Reveal";
import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import { WhatsAppIcon } from "@/components/ui/BrandIcons";
import content from "@/data/content.json";
import events from "@/data/events.json";
import { contact } from "@/lib/contact";
import { dateTimeAttr, formatearFechaEvento, hoyISO, proximosEventos } from "@/lib/events";
import useClientValue from "@/lib/useClientValue";
import { buildEventUrl } from "@/lib/whatsapp";

const ID = "eventos";

/** Tamaños servidos del banner: una columna en mobile, dos en md, tres en lg. */
const SIZES = "(min-width: 1024px) 31vw, (min-width: 768px) 46vw, 92vw";

/**
 * "Próximos eventos". Los datos vienen de `src/data/events.json`, que genera
 * `scripts/build-events.mjs` leyendo `data/eventos.xlsx` antes de cada build.
 *
 * Por que es Client Component: hay que descartar los eventos que ya pasaron, y
 * con `cacheComponents: true` el prerender no puede leer la fecha actual. El
 * filtro corre entonces en el cliente, con `useClientValue`.
 *
 * Mejora progresiva (decision documentada en CLAUDE.md):
 *   - en el HTML prerenderizado y sin JavaScript se ven TODOS los eventos del
 *     JSON, incluso alguno que ya haya pasado. Es tolerante a proposito: mejor
 *     mostrar un evento viejo que esconder la seccion entera;
 *   - con JavaScript, apenas hidrata se descartan los pasados, y si no queda
 *     ninguno la seccion desaparece del DOM.
 *
 * Si `events.json` esta vacio (el caso normal cuando el cliente no cargo nada),
 * la seccion no se renderiza NUNCA y su link no existe en la navegacion, igual
 * que pasa con los testimonios.
 */
export default function Events() {
  // `null` en el servidor y en el primer render: ahi no se filtra nada.
  const hoy = useClientValue(hoyISO, null);
  const visibles = hoy ? proximosEventos(events, hoy) : events;

  if (!Array.isArray(visibles) || visibles.length === 0) return null;

  const { eyebrow, title, subtitle } = content.headings.events;

  return (
    <Section id={ID} className="bg-surface">
      <SectionHeading id={ID} eyebrow={eyebrow} title={title} subtitle={subtitle} />

      <ul className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {visibles.map((evento, index) => (
          <Reveal
            as="li"
            key={`${evento.date}-${evento.title}`}
            delay={(index % 3) * 90}
            className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-surface shadow-sm transition-[box-shadow,transform,border-color] duration-300 hover:-translate-y-1 hover:border-brand-blue/40 hover:shadow-lg"
          >
            <div className="relative aspect-[16/9] w-full bg-brand-navy">
              {evento.banner ? (
                <Image
                  src={`/eventos/${evento.banner}`}
                  alt={evento.title}
                  fill
                  sizes={SIZES}
                  className="object-cover"
                />
              ) : (
                // Fallback decorativo de marca: no aporta informacion, el titulo
                // ya esta como texto debajo.
                <div
                  aria-hidden="true"
                  className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(85%_80%_at_20%_0%,var(--color-brand-navy)_0%,var(--color-brand-navy-deep)_55%,var(--color-brand-black)_100%)]"
                >
                  <CalendarDays className="size-12 text-brand-gold/70" />
                </div>
              )}
            </div>

            <div className="flex flex-1 flex-col p-5 sm:p-6">
              <h3 className="font-display text-xl leading-tight font-bold text-balance text-brand-navy">
                {evento.title}
              </h3>

              <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-semibold text-brand-blue-deep">
                <time
                  dateTime={dateTimeAttr(evento)}
                  className="inline-flex items-center gap-1.5"
                >
                  <CalendarDays className="size-4 shrink-0" aria-hidden="true" />
                  {formatearFechaEvento(evento.date)}
                </time>
                {evento.time ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="size-4 shrink-0" aria-hidden="true" />
                    {evento.time} h
                  </span>
                ) : null}
              </p>

              <p className="mt-3 text-sm leading-relaxed text-pretty text-ink-soft sm:text-base">
                {evento.description}
              </p>

              <div className="mt-auto pt-5">
                <a
                  href={buildEventUrl(evento, { businessName: contact.businessName })}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${content.events.cta}: ${evento.title}`}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-blue px-5 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-brand-blue-deep active:bg-brand-navy"
                >
                  <WhatsAppIcon className="size-4" />
                  {content.events.cta}
                </a>
              </div>
            </div>
          </Reveal>
        ))}
      </ul>
    </Section>
  );
}
