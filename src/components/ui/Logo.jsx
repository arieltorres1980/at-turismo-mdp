import Image from "next/image";

import { contact } from "@/lib/contact";
import logo from "../../../public/brand/logo.jpg";

/**
 * Isologo. El archivo es un JPG con fondo negro solido (no hay version
 * transparente), asi que SIEMPRE va sobre superficie oscura o dentro de un
 * contenedor negro. Ver D8/R7 del PLAN.
 */
export default function Logo({ size = 44, priority = false, className = "" }) {
  return (
    <Image
      src={logo}
      alt={contact.businessName}
      width={size}
      height={size}
      priority={priority}
      sizes={`${size}px`}
      className={`rounded-lg bg-brand-black object-cover ${className}`}
    />
  );
}
