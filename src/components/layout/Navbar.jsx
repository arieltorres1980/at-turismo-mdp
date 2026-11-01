"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Menu, X } from "lucide-react";

import Container from "@/components/ui/Container";
import Logo from "@/components/ui/Logo";
import { WhatsAppIcon } from "@/components/ui/BrandIcons";

/**
 * Barra superior sticky, oscura (el logo JPG necesita fondo negro).
 * Menu mobile accesible: aria-expanded / aria-controls, cierra con Esc y al
 * elegir un link, y devuelve el foco al boton.
 */
export default function Navbar({ items = [], businessName, whatsappHref, ctaLabel }) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef(null);
  const menuId = useId();

  const close = useCallback(
    ({ focusButton = false } = {}) => {
      setOpen(false);
      if (focusButton) buttonRef.current?.focus();
    },
    [],
  );

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") close({ focusButton: true });
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, close]);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-brand-black/95 backdrop-blur supports-[backdrop-filter]:bg-brand-black/80">
      <Container className="flex h-16 items-center justify-between gap-3 sm:h-20">
        <a
          href="#inicio"
          className="flex items-center gap-2 rounded-lg sm:gap-3"
          aria-label={`${businessName} — ir al inicio`}
        >
          <Logo size={44} priority className="size-10 sm:size-12" />
          <span className="font-display text-sm leading-tight font-bold text-white sm:text-base">
            {businessName}
          </span>
        </a>

        <nav aria-label="Principal" className="hidden items-center gap-1 lg:flex">
          {items.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-full px-3 py-2 text-sm font-medium text-brand-mist transition-colors hover:bg-white/10 hover:text-white"
            >
              {item.label}
            </a>
          ))}
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 inline-flex items-center gap-2 rounded-full bg-brand-gold px-4 py-2 text-sm font-semibold text-brand-black transition-colors hover:bg-brand-gold-deep hover:text-white"
          >
            <WhatsAppIcon className="size-4" />
            {ctaLabel}
          </a>
        </nav>

        <button
          ref={buttonRef}
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls={menuId}
          aria-label={open ? "Cerrar el menú" : "Abrir el menú"}
          className="inline-flex size-11 shrink-0 items-center justify-center rounded-lg text-white transition-colors hover:bg-white/10 lg:hidden"
        >
          {open ? <X className="size-6" aria-hidden="true" /> : <Menu className="size-6" aria-hidden="true" />}
        </button>
      </Container>

      <div
        id={menuId}
        hidden={!open}
        className="border-t border-white/10 bg-brand-black lg:hidden"
      >
        <Container className="py-3">
          <nav aria-label="Principal (móvil)" className="flex flex-col">
            {items.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => close()}
                className="rounded-lg px-3 py-3 text-base font-medium text-brand-mist transition-colors hover:bg-white/10 hover:text-white"
              >
                {item.label}
              </a>
            ))}
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => close()}
              className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-brand-gold px-4 py-3 text-base font-semibold text-brand-black"
            >
              <WhatsAppIcon className="size-5" />
              {ctaLabel}
            </a>
          </nav>
        </Container>
      </div>
    </header>
  );
}
