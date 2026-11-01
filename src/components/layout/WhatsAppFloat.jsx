import { WhatsAppIcon } from "@/components/ui/BrandIcons";
import { contact, waLink } from "@/lib/contact";

/**
 * Boton flotante de WhatsApp.
 *
 * Es un `<a>` (nunca un `<button>` adentro de un `<a>`), no depende del hover
 * —en touch no existe— y respeta `env(safe-area-inset-bottom)` para no quedar
 * debajo de la barra del navegador en iOS.
 *
 * Se ubica abajo a la derecha; el boton de envio del formulario ocupa el ancho
 * de la tarjeta y tiene padding inferior extra en mobile para que no se tapen.
 */
export default function WhatsAppFloat() {
  return (
    <a
      href={waLink(contact.whatsapp.defaultMessage)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Escribir por WhatsApp a ${contact.businessName}`}
      className="fixed right-4 z-40 inline-flex size-14 items-center justify-center rounded-full bg-whatsapp text-brand-black shadow-lg shadow-black/25 transition-transform duration-200 hover:scale-105 focus-visible:scale-105 sm:right-6 sm:size-16"
      style={{ bottom: "calc(1rem + env(safe-area-inset-bottom, 0px))" }}
    >
      <WhatsAppIcon className="size-7 sm:size-8" />
    </a>
  );
}
